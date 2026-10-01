
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://idqmkyhwwxdzctlgfazo.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkcW1reWh3d3hkemN0bGdmYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTY0MDcsImV4cCI6MjEwNjM3MjQwN30.VbF0hksnFz6D-ZiySh-jKZsqCXyJpUYhx4b00DN4zYY'

    const supabase = createServerClient(
        url,
        key,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not move this getUser code from the middleware.
    // It is essential to keep the auth cookie alive.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log('[Middleware] User found:', !!user)

    const path = request.nextUrl.pathname
    const isPublicPath = path === '/' || path === '/login' || path === '/register'

    if (!user && !isPublicPath) {
        // If no user and trying to access protected route (and not static resource)
        if (path.startsWith('/_next') || path.startsWith('/api') || path.startsWith('/auth') || path.includes('.')) {
            return supabaseResponse
        }
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        return NextResponse.redirect(redirectUrl)
    }

    // Authenticated users accessing root /, /login, or /register are sent directly to their dashboard
    if (user && (path === '/' || path === '/login' || path === '/register')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
}
