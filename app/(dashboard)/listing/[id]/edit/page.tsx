import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditListingForm } from "@/components/listings/edit-listing-form"

// Catégories par défaut (fallback si la base de données est vide)
const DEFAULT_CATEGORIES = [
  {
    id: "default-1",
    name: "annales-sujets",
    name_fr: "Annales et sujets d'examens",
    icon: "file-text",
    color: "#f59e0b",
  },
  {
    id: "default-2",
    name: "manuels-scolaires",
    name_fr: "Manuels scolaires",
    icon: "graduation-cap",
    color: "#8b5cf6",
  },
  {
    id: "default-3",
    name: "materiels-outils",
    name_fr: "Matériels et outils",
    icon: "package",
    color: "#3b82f6",
  },
  {
    id: "default-4",
    name: "fournitures-scolaires",
    name_fr: "Fournitures scolaires",
    icon: "notebook-pen",
    color: "#10b981",
  },
  {
    id: "default-5",
    name: "autres-documents",
    name_fr: "Autres Documents Académiques",
    icon: "book-open",
    color: "#ec4899",
  },
]

interface EditListingPageProps {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, description, category_id, condition, exchange_type, city, images, user_id")
    .eq("id", id)
    .single()

  if (!listing) {
    notFound()
  }

  if (listing.user_id !== user.id) {
    redirect(`/listing/${id}`)
  }

  const { data: dbCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // Utiliser les catégories de la base si elles existent, sinon utiliser les catégories par défaut
  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Modifier l&apos;annonce
        </h1>
        <p className="text-muted-foreground">
          Modifiez les informations de votre annonce.
        </p>
      </div>

      <EditListingForm
        listing={listing}
        categories={categories}
        currentUserId={user.id}
      />
    </div>
  )
}
