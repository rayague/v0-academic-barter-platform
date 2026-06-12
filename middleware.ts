import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // First, run the auth session update
  const response = await updateSession(request)

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow auth pages without admin check
    if (
      request.nextUrl.pathname.startsWith('/admin/auth/')
    ) {
      return response
    }

    // Check admin status
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
              response.cookies.set(name, value, options)
            )
          },
        },
      },
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/auth/login'
      return NextResponse.redirect(url)
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('is_active')
      .eq('user_id', session.user.id)
      .single()

    if (!adminData || !adminData.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/auth/login'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
