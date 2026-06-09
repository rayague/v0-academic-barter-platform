"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Eye,
  Calendar,
  Star,
  Repeat,
  Flag,
  Edit,
  Zap,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExchangeProposalDialog } from "./exchange-proposal-dialog"
import { createClient } from "@/lib/supabase/client"
import { getCategoryIcon } from "@/lib/utils/category"
import { timeAgo } from "@/lib/utils/date"

const conditionLabels: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon",
  fair: "Correct",
}

const exchangeTypeLabels: Record<string, string> = {
  in_person: "En personne",
  delivery: "Livraison",
  both: "En personne ou livraison",
}

interface ListingDetailProps {
  listing: {
    id: string
    title: string
    description: string | null
    images: string[]
    condition: string
    exchange_type: string
    city: string | null
    views: number
    created_at: string
    profiles: {
      id: string
      full_name: string | null
      email: string | null
      avatar_url: string | null
      city: string | null
      university: string | null
      average_rating: number
      total_exchanges: number
    } | null
    categories: {
      name: string
      name_fr: string
      icon: string
      color: string
    } | null
  }
  isFavorited: boolean
  isOwner: boolean
  currentUserId: string
}

export function ListingDetail({ listing, isFavorited: initialFavorited, isOwner, currentUserId }: ListingDetailProps) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false)

  const CategoryIcon = getCategoryIcon(listing.categories?.icon || "package")
  const hasImages = listing.images && listing.images.length > 0

  const handleFavorite = async () => {
    setLoading(true)
    const supabase = createClient()

    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", currentUserId)
        .eq("listing_id", listing.id)
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: currentUserId, listing_id: listing.id })
    }

    setIsFavorited(!isFavorited)
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleFavorite} disabled={loading}>
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          {isOwner && (
            <>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/listing/${listing.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
            {hasImages ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CategoryIcon className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
            {/* Category badge */}
            <div
              className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: listing.categories?.color || "#6366f1" }}
            >
              <CategoryIcon className="h-4 w-4" />
              {listing.categories?.name_fr || "Autre"}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h1 className="mb-4 text-2xl font-bold">{listing.title}</h1>

            <div className="mb-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                <Repeat className="h-3.5 w-3.5" />
                {conditionLabels[listing.condition] || listing.condition}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {exchangeTypeLabels[listing.exchange_type] || listing.exchange_type}
              </span>
              {listing.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.city}
                </span>
              )}
            </div>

            {listing.description && (
              <div className="mb-6">
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {listing.views} vues
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {timeAgo(listing.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {listing.profiles?.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-semibold">{listing.profiles?.full_name || "Utilisateur"}</p>
                {listing.profiles?.email && (
                  <p className="text-xs text-muted-foreground truncate">{listing.profiles.email}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {listing.profiles?.average_rating?.toFixed(1) || "0.0"}
                  </span>
                  <span>&bull;</span>
                  <span>{listing.profiles?.total_exchanges || 0} échanges</span>
                </div>
              </div>
            </div>

            {listing.profiles?.university && (
              <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                {listing.profiles.university}
              </p>
            )}

            {listing.profiles?.city && (
              <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {listing.profiles.city}
              </p>
            )}

            {!isOwner && (
              <div>
                {/* Bouton Proposer un échange avec effets couleur */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => setExchangeDialogOpen(true)}
                    disabled={!currentUserId}
                    className="w-full gap-2 relative overflow-hidden bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Effet de scintillement */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                      animate={{
                        opacity: [0, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    <Zap className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Proposer un échange</span>
                  </Button>
                </motion.div>
              </div>
            )}

            {isOwner && (
              <p className="text-center text-sm text-muted-foreground">
                Ceci est votre annonce
              </p>
            )}
          </div>

          {/* Report */}
          {!isOwner && (
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
              <Flag className="h-4 w-4" />
              Signaler l'annonce
            </Button>
          )}
        </div>
      </div>

      {/* Exchange Proposal Dialog */}
      <ExchangeProposalDialog
        open={exchangeDialogOpen}
        onOpenChange={setExchangeDialogOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        receiverId={listing.profiles?.id || ""}
        currentUserId={currentUserId}
      />
    </motion.div>
  )
}
