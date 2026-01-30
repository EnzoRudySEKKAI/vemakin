export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            brands: {
                Row: {
                    id: string
                    name: string
                }
                Insert: {
                    id?: string
                    name: string
                }
                Update: {
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                }
                Relationships: []
            }
            gear_catalog: {
                Row: {
                    brand_id: string | null
                    category_id: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    image_url: string | null
                    name: string
                }
                Insert: {
                    brand_id?: string | null
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name: string
                }
                Update: {
                    brand_id?: string | null
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "gear_catalog_brand_id_fkey"
                        columns: ["brand_id"]
                        isOneToOne: false
                        referencedRelation: "brands"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "gear_catalog_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            notes: {
                Row: {
                    attachments: Json | null
                    content: string | null
                    created_at: string | null
                    id: string
                    project_id: string
                    shot_id: string | null
                    task_id: string | null
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    attachments?: Json | null
                    content?: string | null
                    created_at?: string | null
                    id?: string
                    project_id: string
                    shot_id?: string | null
                    task_id?: string | null
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    attachments?: Json | null
                    content?: string | null
                    created_at?: string | null
                    id?: string
                    project_id?: string
                    shot_id?: string | null
                    task_id?: string | null
                    title?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "notes_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notes_shot_id_fkey"
                        columns: ["shot_id"]
                        isOneToOne: false
                        referencedRelation: "shots"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notes_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: false
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    }
                ]
            }
            projects: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "projects_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            shot_equipment: {
                Row: {
                    inventory_item_id: string
                    is_prepared: boolean | null
                    shot_id: string
                }
                Insert: {
                    inventory_item_id: string
                    is_prepared?: boolean | null
                    shot_id: string
                }
                Update: {
                    inventory_item_id?: string
                    is_prepared?: boolean | null
                    shot_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "shot_equipment_inventory_item_id_fkey"
                        columns: ["inventory_item_id"]
                        isOneToOne: false
                        referencedRelation: "user_inventory"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "shot_equipment_shot_id_fkey"
                        columns: ["shot_id"]
                        isOneToOne: false
                        referencedRelation: "shots"
                        referencedColumns: ["id"]
                    }
                ]
            }
            shots: {
                Row: {
                    created_at: string | null
                    date: string | null
                    description: string | null
                    duration: string | null
                    general_notes: string | null
                    id: string
                    location: string | null
                    project_id: string
                    remarks: string | null
                    scene_number: string | null
                    start_time: string | null
                    status: string | null
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    duration?: string | null
                    general_notes?: string | null
                    id?: string
                    location?: string | null
                    project_id: string
                    remarks?: string | null
                    scene_number?: string | null
                    start_time?: string | null
                    status?: string | null
                    title: string
                }
                Update: {
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    duration?: string | null
                    general_notes?: string | null
                    id?: string
                    location?: string | null
                    project_id?: string
                    remarks?: string | null
                    scene_number?: string | null
                    start_time?: string | null
                    status?: string | null
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "shots_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    }
                ]
            }
            specs_cameras: {
                Row: {
                    dynamic_range: string | null
                    gear_id: string
                    media: string | null
                    mount: string | null
                    native_iso: string | null
                    resolution: string | null
                    sensor: string | null
                    weight: string | null
                }
                Insert: {
                    dynamic_range?: string | null
                    gear_id: string
                    media?: string | null
                    mount?: string | null
                    native_iso?: string | null
                    resolution?: string | null
                    sensor?: string | null
                    weight?: string | null
                }
                Update: {
                    dynamic_range?: string | null
                    gear_id?: string
                    media?: string | null
                    mount?: string | null
                    native_iso?: string | null
                    resolution?: string | null
                    sensor?: string | null
                    weight?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "specs_cameras_gear_id_fkey"
                        columns: ["gear_id"]
                        isOneToOne: true
                        referencedRelation: "gear_catalog"
                        referencedColumns: ["id"]
                    }
                ]
            }
            specs_lenses: {
                Row: {
                    aperture: string | null
                    coverage: string | null
                    focal_length: string | null
                    front_diameter: string | null
                    gear_id: string
                    min_focus: string | null
                    mount: string | null
                    weight: string | null
                }
                Insert: {
                    aperture?: string | null
                    coverage?: string | null
                    focal_length?: string | null
                    front_diameter?: string | null
                    gear_id: string
                    min_focus?: string | null
                    mount?: string | null
                    weight?: string | null
                }
                Update: {
                    aperture?: string | null
                    coverage?: string | null
                    focal_length?: string | null
                    front_diameter?: string | null
                    gear_id?: string
                    min_focus?: string | null
                    mount?: string | null
                    weight?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "specs_lenses_gear_id_fkey"
                        columns: ["gear_id"]
                        isOneToOne: true
                        referencedRelation: "gear_catalog"
                        referencedColumns: ["id"]
                    }
                ]
            }
            specs_lights: {
                Row: {
                    cct: string | null
                    cri: string | null
                    gear_id: string
                    mount: string | null
                    output: string | null
                    power_draw: string | null
                    type_class: string | null
                    weight: string | null
                }
                Insert: {
                    cct?: string | null
                    cri?: string | null
                    gear_id: string
                    mount?: string | null
                    output?: string | null
                    power_draw?: string | null
                    type_class?: string | null
                    weight?: string | null
                }
                Update: {
                    cct?: string | null
                    cri?: string | null
                    gear_id?: string
                    mount?: string | null
                    output?: string | null
                    power_draw?: string | null
                    type_class?: string | null
                    weight?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "specs_lights_gear_id_fkey"
                        columns: ["gear_id"]
                        isOneToOne: true
                        referencedRelation: "gear_catalog"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tasks: {
                Row: {
                    created_at: string | null
                    description: string | null
                    due_date: string | null
                    id: string
                    metadata: Json | null
                    priority: string | null
                    project_id: string
                    status: string | null
                    title: string
                    type: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    due_date?: string | null
                    id?: string
                    metadata?: Json | null
                    priority?: string | null
                    project_id: string
                    status?: string | null
                    title: string
                    type: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    due_date?: string | null
                    id?: string
                    metadata?: Json | null
                    priority?: string | null
                    project_id?: string
                    status?: string | null
                    title?: string
                    type?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tasks_color: {
                Row: {
                    colorspace: string | null
                    lut_used: string | null
                    task_id: string
                }
                Insert: {
                    colorspace?: string | null
                    lut_used?: string | null
                    task_id: string
                }
                Update: {
                    colorspace?: string | null
                    lut_used?: string | null
                    task_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_color_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: true
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tasks_editing: {
                Row: {
                    software_used: string | null
                    task_id: string
                    timeline_version: string | null
                }
                Insert: {
                    software_used?: string | null
                    task_id: string
                    timeline_version?: string | null
                }
                Update: {
                    software_used?: string | null
                    task_id?: string
                    timeline_version?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_editing_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: true
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tasks_script: {
                Row: {
                    page_count: number | null
                    scene_count: number | null
                    script_version: string | null
                    task_id: string
                }
                Insert: {
                    page_count?: number | null
                    scene_count?: number | null
                    script_version?: string | null
                    task_id: string
                }
                Update: {
                    page_count?: number | null
                    scene_count?: number | null
                    script_version?: string | null
                    task_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_script_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: true
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tasks_sound: {
                Row: {
                    audio_format: string | null
                    duration_minutes: number | null
                    task_id: string
                }
                Insert: {
                    audio_format?: string | null
                    duration_minutes?: number | null
                    task_id: string
                }
                Update: {
                    audio_format?: string | null
                    duration_minutes?: number | null
                    task_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_sound_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: true
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tasks_vfx: {
                Row: {
                    asset_type: string | null
                    shot_count: number | null
                    task_id: string
                }
                Insert: {
                    asset_type?: string | null
                    shot_count?: number | null
                    task_id: string
                }
                Update: {
                    asset_type?: string | null
                    shot_count?: number | null
                    task_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_vfx_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: true
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_inventory: {
                Row: {
                    created_at: string | null
                    custom_name: string | null
                    gear_id: string
                    id: string
                    purchase_date: string | null
                    serial_number: string | null
                    status: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    custom_name?: string | null
                    gear_id: string
                    id?: string
                    purchase_date?: string | null
                    serial_number?: string | null
                    status?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    custom_name?: string | null
                    gear_id?: string
                    id?: string
                    purchase_date?: string | null
                    serial_number?: string | null
                    status?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_inventory_gear_id_fkey"
                        columns: ["gear_id"]
                        isOneToOne: false
                        referencedRelation: "gear_catalog"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_inventory_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            users: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string | null
                    first_connection: boolean | null
                    id: string
                    name: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    first_connection?: boolean | null
                    id: string
                    name?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    first_connection?: boolean | null
                    id?: string
                    name?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
