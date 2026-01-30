import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: undefined // defaults to window.location.origin, using Vite proxy at /api/auth
})
