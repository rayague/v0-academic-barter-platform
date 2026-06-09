import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PaymentForm } from "@/components/publish/payment-form"

interface PublishPaymentPageProps {
  searchParams: Promise<{ listing_id?: string }>
}

export default async function PublishPaymentPage({ searchParams }: PublishPaymentPageProps) {
  const { listing_id: listingId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Vérifier que l'annonce existe et appartient à l'utilisateur
  if (listingId) {
    const { data: listing } = await supabase
      .from("listings")
      .select("id, status, title")
      .eq("id", listingId)
      .eq("user_id", user.id)
      .single()

    if (!listing) {
      redirect("/publish")
    }

    // Si l'annonce n'est pas en attente de paiement, rediriger
    if (listing.status !== "pending_payment") {
      redirect("/dashboard")
    }
  } else {
    // Pas d'ID d'annonce, rediriger vers la publication
    redirect("/publish")
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="gradient-text">Microtaxe</span> de Publication
        </h1>
        <p className="text-muted-foreground">
          Payez 1 FCFA pour publier votre annonce et la rendre visible
        </p>
      </div>

      <PaymentForm userId={user.id} listingId={listingId} />
    </div>
  )
}
