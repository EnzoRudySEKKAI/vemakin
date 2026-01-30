import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { db } from "./db";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// Configure CORS
app.use(
    "/api/*",
    cors({
        origin: (origin) => {
            return origin.startsWith("http://localhost:") || origin === "vemakin://*" ? origin : "http://localhost:3000";
        },
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// Health check
app.get("/health", (c) => c.text("OK"));

// Initialization API (Bundled Data)
app.get("/api/init", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const userId = session.user.id;
    const lastProjectId = (session.user as any).lastProjectId || (session.user as any).last_project_id;

    // Parallelize all independent fetches
    const [projects, categories, catalogRaw, inventoryRaw, projectData] = await Promise.all([
        // 1. Projects
        db.selectFrom("projects").selectAll().where("user_id", "=", userId).orderBy("updated_at", "desc").execute(),

        // 2. Categories
        db.selectFrom("categories").selectAll().execute(),

        // 3. Catalog (Joined)
        db.selectFrom("gear_catalog")
            .leftJoin("brands", "gear_catalog.brand_id", "brands.id")
            .leftJoin("categories", "gear_catalog.category_id", "categories.id")
            .select([
                "gear_catalog.id",
                "gear_catalog.name",
                "gear_catalog.description",
                "gear_catalog.image_url",
                "brands.name as brand_name",
                "categories.name as category_name",
                "categories.slug as category_slug"
            ]).execute(),

        // 4. User Inventory (Joined)
        db.selectFrom("user_inventory")
            .innerJoin("gear_catalog", "user_inventory.gear_id", "gear_catalog.id")
            .leftJoin("brands", "gear_catalog.brand_id", "brands.id")
            .leftJoin("categories", "gear_catalog.category_id", "categories.id")
            .select([
                "user_inventory.id as id",
                "user_inventory.serial_number as serialNumber",
                "user_inventory.status",
                "user_inventory.location",
                "user_inventory.custom_name as customName",
                "user_inventory.purchase_date as purchaseDate",
                "user_inventory.is_owned as isOwned",
                "user_inventory.price_per_day as pricePerDay",
                "user_inventory.rental_price as rentalPrice",
                "user_inventory.rental_frequency as rentalFrequency",
                "gear_catalog.id as gearId",
                "gear_catalog.name as name",
                "gear_catalog.image_url as image",
                "brands.name as brand",
                "categories.name as category",
                "categories.slug as categorySlug"
            ])
            .where("user_inventory.user_id", "=", userId)
            .execute(),

        // 5. Active Project Data (if exists)
        lastProjectId ? (async () => {
            // Verify ownership
            const project = await db.selectFrom("projects").select("id").where("id", "=", lastProjectId).where("user_id", "=", userId).executeTakeFirst();
            if (!project) return null;

            const shotsRaw = await db.selectFrom("shots").selectAll().where("project_id", "=", lastProjectId).execute();
            const shotIds = shotsRaw.map(s => s.id);
            const shotEquipment = shotIds.length > 0 ? await db.selectFrom("shot_equipment").selectAll().where("shot_id", "in", shotIds).execute() : [];
            const shots = shotsRaw.map(s => ({ ...s, shot_equipment: shotEquipment.filter((se: any) => se.shot_id === s.id) }));

            const tasksRaw = await db.selectFrom("tasks").selectAll().where("project_id", "=", lastProjectId).execute();
            const taskIds = tasksRaw.map(t => t.id);
            let tasks = tasksRaw;
            if (taskIds.length > 0) {
                const [scripts, vfx, sound, color, editing] = await Promise.all([
                    db.selectFrom("tasks_script").selectAll().where("task_id", "in", taskIds).execute(),
                    db.selectFrom("tasks_vfx").selectAll().where("task_id", "in", taskIds).execute(),
                    db.selectFrom("tasks_sound").selectAll().where("task_id", "in", taskIds).execute(),
                    db.selectFrom("tasks_color").selectAll().where("task_id", "in", taskIds).execute(),
                    db.selectFrom("tasks_editing").selectAll().where("task_id", "in", taskIds).execute()
                ]);
                tasks = tasksRaw.map((t: any) => ({
                    ...t,
                    script: scripts.find(s => s.task_id === t.id),
                    vfx: vfx.find(v => v.task_id === t.id),
                    sound: sound.find(s => s.task_id === t.id),
                    color: color.find(c => c.task_id === t.id),
                    editing: editing.find(e => e.task_id === t.id)
                }));
            }

            const notes = await db.selectFrom("notes").selectAll().where("project_id", "=", lastProjectId).execute();
            return { shots, tasks, notes, id: lastProjectId };
        })() : Promise.resolve(null)
    ]);

    // Process Inventory Specs
    const itemsByCategory: Record<string, string[]> = {};
    inventoryRaw.forEach(item => {
        const cat = (item as any).category;
        const gid = (item as any).gearId;
        if (cat) {
            if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
            itemsByCategory[cat].push(gid);
        }
    });

    const tableMapping: Record<string, string> = {
        'Camera': 'specs_cameras',
        'Lens': 'specs_lenses',
        'Light': 'specs_lights',
        'Filter': 'specs_filters',
        'Tripod': 'specs_tripods',
        'Stabilizer': 'specs_stabilizers',
        'Audio': 'specs_audio',
        'Grip': 'specs_grip',
        'Monitoring': 'specs_monitoring',
        'Wireless': 'specs_wireless',
        'Drone': 'specs_drones',
        'Props': 'specs_props'
    };

    const specsMap: Record<string, any> = {};
    await Promise.all(Object.entries(itemsByCategory).map(async ([category, gearIds]) => {
        const tableName = tableMapping[category];
        if (tableName && gearIds.length > 0) {
            const specs = await db.selectFrom(tableName as any).selectAll().where("gear_id", "in", gearIds).execute();
            specs.forEach((spec: any) => {
                const { gear_id, ...specData } = spec;
                specsMap[gear_id] = specData;
            });
        }
    }));

    const inventory = inventoryRaw.map(item => ({
        ...item,
        specs: specsMap[(item as any).gearId] || {}
    }));

    return c.json({
        projects,
        categories,
        catalog: catalogRaw,
        inventory,
        activeProjectData: projectData
    });
});

// Auth session middleware
const getSession = async (c: any) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    });
    return session;
};

// Projects API
app.get("/api/projects", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const projects = await db
        .selectFrom("projects")
        .selectAll()
        .where("user_id", "=", session.user.id)
        .orderBy("updated_at", "desc")
        .execute();

    return c.json(projects);
});

app.post("/api/projects", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const { name, description } = await c.req.json();

    const project = await db
        .insertInto("projects")
        .values({
            id: crypto.randomUUID(),
            name,
            description,
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .returningAll()
        .executeTakeFirst();

    return c.json(project);
});

app.patch("/api/projects/:id", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const updates = await c.req.json();

    const project = await db
        .updateTable("projects")
        .set({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .where("id", "=", id)
        .where("user_id", "=", session.user.id)
        .returningAll()
        .executeTakeFirst();

    return c.json(project);
});

app.delete("/api/projects/:id", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");

    await db
        .deleteFrom("projects")
        .where("id", "=", id)
        .where("user_id", "=", session.user.id)
        .execute();

    return c.json({ success: true });
});

// Get all data for a project (Shots, Tasks, Notes)
app.get("/api/projects/:id/data", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const projectId = c.req.param("id");

    // Verify ownership of project
    const project = await db
        .selectFrom("projects")
        .select("id")
        .where("id", "=", projectId)
        .where("user_id", "=", session.user.id)
        .executeTakeFirst();

    if (!project) return c.json({ error: "Project not found or unauthorized" }, 404);

    // Fetch Shots with Equipment
    const shotsRaw = await db
        .selectFrom("shots")
        .selectAll()
        .where("project_id", "=", projectId)
        .execute();

    const shotIds = shotsRaw.map(s => s.id);
    const shotEquipment = shotIds.length > 0 ? await db
        .selectFrom("shot_equipment")
        .selectAll()
        .where("shot_id", "in", shotIds)
        .execute() : [];

    const shots = shotsRaw.map(s => ({
        ...s,
        shot_equipment: shotEquipment.filter((se: any) => se.shot_id === s.id)
    }));

    // Fetch Tasks with polymorphic details
    const tasksRaw = await db
        .selectFrom("tasks")
        .selectAll()
        .where("project_id", "=", projectId)
        .execute();

    const taskIds = tasksRaw.map(t => t.id);
    if (taskIds.length > 0) {
        const scripts = await db.selectFrom("tasks_script").selectAll().where("task_id", "in", taskIds).execute();
        const vfx = await db.selectFrom("tasks_vfx").selectAll().where("task_id", "in", taskIds).execute();
        const sound = await db.selectFrom("tasks_sound").selectAll().where("task_id", "in", taskIds).execute();
        const color = await db.selectFrom("tasks_color").selectAll().where("task_id", "in", taskIds).execute();
        const auditing = await db.selectFrom("tasks_editing").selectAll().where("task_id", "in", taskIds).execute();

        const tasks = tasksRaw.map(t => ({
            ...t,
            script: scripts.find(s => s.task_id === t.id),
            vfx: vfx.find(v => v.task_id === t.id),
            sound: sound.find(s => s.task_id === t.id),
            color: color.find(c => c.task_id === t.id),
            editing: auditing.find(e => e.task_id === t.id)
        }));

        const notes = await db
            .selectFrom("notes")
            .selectAll()
            .where("project_id", "=", projectId)
            .execute();

        return c.json({ shots, tasks, notes });
    }

    const notes = await db
        .selectFrom("notes")
        .selectAll()
        .where("project_id", "=", projectId)
        .execute();

    return c.json({ shots, tasks: tasksRaw, notes });
});

// Gear Categories API
app.get("/api/gear/categories", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const categories = await db
        .selectFrom("categories")
        .selectAll()
        .execute();

    return c.json(categories);
});

// Gear Catalog API
app.get("/api/gear/catalog", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const catalog = await db
        .selectFrom("gear_catalog")
        .leftJoin("brands", "gear_catalog.brand_id", "brands.id")
        .leftJoin("categories", "gear_catalog.category_id", "categories.id")
        .select([
            "gear_catalog.id",
            "gear_catalog.name",
            "gear_catalog.description",
            "gear_catalog.image_url",
            "brands.name as brand_name",
            "categories.name as category_name",
            "categories.slug as category_slug"
        ])
        .execute();

    return c.json(catalog);
});

// Gear Catalog Specs API
app.get("/api/gear/catalog/:id/specs", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const gearId = c.req.param("id");

    // Check which category it belongs to to find the right spec table
    const gear = await db
        .selectFrom("gear_catalog")
        .innerJoin("categories", "gear_catalog.category_id", "categories.id")
        .select("categories.name as category_name")
        .where("gear_catalog.id", "=", gearId)
        .executeTakeFirst();

    if (!gear) return c.json({ error: "Gear not found" }, 404);

    const tableMapping: Record<string, string> = {
        'Camera': 'specs_cameras',
        'Lens': 'specs_lenses',
        'Light': 'specs_lights',
        'Filter': 'specs_filters',
        'Tripod': 'specs_tripods',
        'Stabilizer': 'specs_stabilizers',
        'Audio': 'specs_audio',
        'Grip': 'specs_grip',
        'Monitoring': 'specs_monitoring',
        'Wireless': 'specs_wireless',
        'Drone': 'specs_drones',
        'Props': 'specs_props'
    };

    const tableName = tableMapping[gear.category_name];
    if (!tableName) return c.json({});

    const specs = await db
        .selectFrom(tableName as any)
        .selectAll()
        .where("gear_id", "=", gearId)
        .executeTakeFirst();

    return c.json(specs || {});
});

// Inventory API
app.get("/api/inventory", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    // Fetch user inventory with gear details
    const inventory = await db
        .selectFrom("user_inventory")
        .innerJoin("gear_catalog", "user_inventory.gear_id", "gear_catalog.id")
        .leftJoin("brands", "gear_catalog.brand_id", "brands.id")
        .leftJoin("categories", "gear_catalog.category_id", "categories.id")
        .select([
            "user_inventory.id as id",
            "user_inventory.serial_number as serialNumber",
            "user_inventory.status",
            "user_inventory.location",
            "user_inventory.custom_name as customName",
            "user_inventory.purchase_date as purchaseDate",
            "user_inventory.is_owned as isOwned",
            "user_inventory.price_per_day as pricePerDay",
            "user_inventory.rental_price as rentalPrice",
            "user_inventory.rental_frequency as rentalFrequency",
            "gear_catalog.id as gearId",
            "gear_catalog.name as name",
            "gear_catalog.image_url as image",
            "brands.name as brand",
            "categories.name as category",
            "categories.slug as categorySlug"
        ])
        .where("user_inventory.user_id", "=", session.user.id)
        .execute();

    // Group by category to fetch specs efficiently
    const itemsByCategory: Record<string, string[]> = {};
    inventory.forEach(item => {
        const cat = (item as any).category;
        const gid = (item as any).gearId;
        if (cat) {
            if (!itemsByCategory[cat]) {
                itemsByCategory[cat] = [];
            }
            itemsByCategory[cat].push(gid);
        }
    });

    const tableMapping: Record<string, string> = {
        'Camera': 'specs_cameras',
        'Lens': 'specs_lenses',
        'Light': 'specs_lights',
        'Filter': 'specs_filters',
        'Tripod': 'specs_tripods',
        'Stabilizer': 'specs_stabilizers',
        'Audio': 'specs_audio',
        'Grip': 'specs_grip',
        'Monitoring': 'specs_monitoring',
        'Wireless': 'specs_wireless',
        'Drone': 'specs_drones',
        'Props': 'specs_props'
    };

    const specsMap: Record<string, any> = {};

    for (const [category, gearIds] of Object.entries(itemsByCategory)) {
        const tableName = tableMapping[category];
        if (tableName && gearIds.length > 0) {
            const specs = await db
                .selectFrom(tableName as any)
                .selectAll()
                .where("gear_id", "in", gearIds)
                .execute();

            specs.forEach((spec: any) => {
                const { gear_id, ...specData } = spec;
                specsMap[gear_id] = specData;
            });
        }
    }

    const enrichedInventory = inventory.map(item => ({
        ...item,
        specs: specsMap[(item as any).gearId] || {}
    }));

    return c.json(enrichedInventory);
});

app.post("/api/inventory", async (c) => {
    try {
        const session = await getSession(c);
        if (!session) return c.json({ error: "Unauthorized" }, 401);

        const data = await c.req.json();
        console.log("Received inventory payload:", data);

        const {
            gear_id,
            custom_name,
            serial_number,
            is_owned,
            price_per_day,
            rental_price,
            rental_frequency
        } = data;

        if (!gear_id) {
            console.error("Missing gear_id in payload");
            return c.json({ error: "gear_id is required" }, 400);
        }

        const newItem = await db
            .insertInto("user_inventory")
            .values({
                id: crypto.randomUUID(),
                user_id: session.user.id,
                gear_id,
                custom_name,
                serial_number,
                is_owned: !!is_owned, // Ensure boolean
                price_per_day: price_per_day !== undefined && price_per_day !== null ? Number(price_per_day) : null,
                rental_price: rental_price !== undefined && rental_price !== null ? Number(rental_price) : null,
                rental_frequency,
                status: 'operational',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .returningAll()
            .executeTakeFirst();

        if (!newItem) {
            console.error("Failed to insert inventory item");
            return c.json({ error: "Failed to create inventory item" }, 500);
        }

        // Fetch joined data to return
        const joinedItem = await db
            .selectFrom("user_inventory")
            .innerJoin("gear_catalog", "user_inventory.gear_id", "gear_catalog.id")
            .leftJoin("brands", "gear_catalog.brand_id", "brands.id")
            .leftJoin("categories", "gear_catalog.category_id", "categories.id")
            .select([
                "user_inventory.id as id",
                "user_inventory.serial_number as serialNumber",
                "user_inventory.status",
                "user_inventory.location",
                "user_inventory.custom_name as customName",
                "user_inventory.purchase_date as purchaseDate",
                "user_inventory.is_owned as isOwned",
                "user_inventory.price_per_day as pricePerDay",
                "user_inventory.rental_price as rentalPrice",
                "user_inventory.rental_frequency as rentalFrequency",
                "gear_catalog.id as gearId",
                "gear_catalog.name as name",
                "gear_catalog.image_url as image",
                "brands.name as brand",
                "categories.name as category",
                "categories.slug as categorySlug"
            ])
            .where("user_inventory.id", "=", newItem.id)
            .executeTakeFirst();

        // Fetch specs for the new item
        if (joinedItem && (joinedItem as any).category) {
            const tableMapping: Record<string, string> = {
                'Camera': 'specs_cameras',
                'Lens': 'specs_lenses',
                'Light': 'specs_lights',
                'Filter': 'specs_filters',
                'Tripod': 'specs_tripods',
                'Stabilizer': 'specs_stabilizers',
                'Audio': 'specs_audio',
                'Grip': 'specs_grip',
                'Monitoring': 'specs_monitoring',
                'Wireless': 'specs_wireless',
                'Drone': 'specs_drones',
                'Props': 'specs_props'
            };

            const tableName = tableMapping[(joinedItem as any).category];
            if (tableName) {
                const specs = await db
                    .selectFrom(tableName as any)
                    .selectAll()
                    .where("gear_id", "=", (joinedItem as any).gearId)
                    .executeTakeFirst();

                if (specs) {
                    const { gear_id, ...specData } = specs;
                    (joinedItem as any).specs = specData;
                } else {
                    (joinedItem as any).specs = {};
                }
            } else {
                (joinedItem as any).specs = {};
            }
        }

        return c.json(joinedItem);
    } catch (e) {
        console.error("Error creating inventory item:", e);
        return c.json({ error: (e as Error).message }, 500);
    }
});

// User Profile API
app.patch("/api/users/profile", async (c) => {
    const session = await getSession(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const updates = await c.req.json();

    // Whitelist allowed updates
    const allowedUpdates: any = {};
    if (updates.last_project_id !== undefined) allowedUpdates.last_project_id = updates.last_project_id;
    if (updates.name !== undefined) allowedUpdates.name = updates.name;

    if (Object.keys(allowedUpdates).length === 0) {
        return c.json({ error: "No valid updates provided" }, 400);
    }

    const updatedUser = await db
        .updateTable("users")
        .set(allowedUpdates)
        .where("id", "=", session.user.id)
        .returningAll()
        .executeTakeFirst();

    return c.json(updatedUser);
});

// Better Auth handler
app.on(["POST", "GET"], "/api/auth/**", (c) => {
    return auth.handler(c.req.raw);
});

const port = 4000;
console.log(`Server is running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
