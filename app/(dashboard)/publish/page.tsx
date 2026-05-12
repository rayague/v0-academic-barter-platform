import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublishForm } from "@/components/publish/publish-form"

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

export default async function PublishPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
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
          <span className="gradient-text">Publier</span> une Annonce
        </h1>
        <p className="text-muted-foreground">
          Partagez vos ressources académiques avec d&apos;autres utilisateurs
        </p>
      </div>

      <PublishForm categories={categories} />
    </div>
  )
}
