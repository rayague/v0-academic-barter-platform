import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url, city),
      categories:category_id (name, name_fr, icon, color)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5)

  return NextResponse.json({
    count: listings?.length ?? 0,
    error: error ? { message: error.message, details: error.details, hint: error.hint } : null,
    listings: listings ?? [],
  })
}
