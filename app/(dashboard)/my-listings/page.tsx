import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ListingCard } from "@/components/listings/listing-card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: listings } = await supabase
    .from("listings")
    .select(`
      *,
      profiles:user_id (full_name, avatar_url, city),
      categories:category_id (name, name_fr, icon, color)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Mes <span className="gradient-text">Annonces</span>
          </h1>
          <p className="text-muted-foreground">
            Gérez vos annonces publiées
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/publish">
            <Plus className="h-4 w-4" />
            Nouvelle annonce
          </Link>
        </Button>
      </div>

      {listings && listings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-16">
          <p className="mb-4 text-muted-foreground">Aucune annonce pour le moment</p>
          <Button asChild>
            <Link href="/publish">Créer Votre Première Annonce</Link>
          </Button>
        </div>
      )}
    </div>
  )
}