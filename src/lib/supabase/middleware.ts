
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && (path === '/login' || path === '/register')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
