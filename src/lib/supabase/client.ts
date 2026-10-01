
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://idqmkyhwwxdzctlgfazo.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkcW1reWh3d3hkemN0bGdmYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTY0MDcsImV4cCI6MjEwNjM3MjQwN30.VbF0hksnFz6D-ZiySh-jKZsqCXyJpUYhx4b00DN4zYY'
    return createBrowserClient(url, key)
}
