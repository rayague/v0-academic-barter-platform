'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'

interface ExchangeProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
  listingTitle: string
  receiverId: string
  currentUserId: string
}

interface UserListing {
  id: string
  title: string
  condition: string
}

export function ExchangeProposalDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  receiverId,
  currentUserId,
}: ExchangeProposalDialogProps) {
  const router = useRouter()
  const [selectedArticleId, setSelectedArticleId] = useState<string>('')
  const [contactEmail, setContactEmail] = useState<string>('')
  const [contactPhone, setContactPhone] = useState<string>('')
  const [userListings, setUserListings] = useState<UserListing[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingListings, setLoadingListings] = useState(true)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Charger les annonces de l'utilisateur quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      loadUserListings()
      setSuccess(false)
      setSelectedArticleId('')
      setContactEmail('')
      setContactPhone('')
      setErrors({})
    }
  }, [open])

  // Valider email en temps réel
  const validateEmail = (email: string) => {
    if (!email) return ''
    return email.includes('@') ? '' : 'Email invalide'
  }

  // Valider téléphone en temps réel
  const validatePhone = (phone: string) => {
    if (!phone) return ''
    return /^[\d\s\-\+\(\)]+$/.test(phone) ? '' : 'Numéro invalide'
  }

  const handleEmailChange = (value: string) => {
    setContactEmail(value)
    setErrors(prev => ({
      ...prev,
      email: validateEmail(value)
    }))
  }

  const handlePhoneChange = (value: string) => {
    setContactPhone(value)
    setErrors(prev => ({
      ...prev,
      phone: validatePhone(value)
    }))
  }

  const loadUserListings = async () => {
    try {
      setLoadingListings(true)
      const supabase = createClient()

      const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, condition')
        .eq('user_id', currentUserId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserListings(listings || [])

      if (!listings || listings.length === 0) {
        toast.error('Vous devez publier au moins une annonce pour proposer un échange')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement'
      console.error(message)
      toast.error(message)
    } finally {
      setLoadingListings(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!selectedArticleId) {
      toast.error('Veuillez sélectionner un article')
      return
    }

    if (!contactEmail && !contactPhone) {
      toast.error('Veuillez fournir un email ou un numéro de téléphone')
      return
    }

    // Valider les champs
    const emailError = validateEmail(contactEmail)
    const phoneError = validatePhone(contactPhone)

    if (emailError || phoneError) {
      setErrors({
        email: emailError,
        phone: phoneError
      })
      toast.error('Veuillez corriger les erreurs')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Créer l'échange
      const { data: insertedExchange, error: insertError } = await supabase
        .from('exchanges')
        .insert({
          giver_id: currentUserId,
          receiver_id: receiverId,
          listing_id: listingId,
          status: 'pending',
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      if (!insertedExchange?.id) {
        throw new Error('Erreur lors de la création de l\'échange')
      }

      // Créer une notification pour le propriétaire
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: receiverId,
          actor_id: currentUserId,
          type: 'exchange_proposed',
          data: {
            exchange_id: insertedExchange.id,
            listing_id: listingId,
            listing_title: listingTitle,
            proposed_article_id: selectedArticleId,
            contact_email: contactEmail || null,
            contact_phone: contactPhone || null,
          },
        })

      if (notifError) {
        console.error('Erreur notification:', notifError)
        // On continue même si la notification échoue
      }

      setSuccess(true)
      toast.success('Demande d\'échange envoyée avec succès!')
      
      // Fermer le dialog après 2 secondes
      setTimeout(() => {
        onOpenChange(false)
        router.refresh()
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite'
      console.error('Erreur échange:', message)
      toast.error(message)
      setLoading(false)
    }
  }

  const hasListings = userListings.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proposer un échange</DialogTitle>
          <DialogDescription>
            Proposez un échange pour: <strong>{listingTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Demande envoyée!</h3>
              <p className="text-sm text-muted-foreground">
                L'utilisateur recevra une notification
              </p>
            </div>
          </div>
        ) : loadingListings ? (
          <div className="py-8 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : !hasListings ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Aucune annonce publiée</h3>
              <p className="text-sm text-muted-foreground">
                Vous devez publier au moins une annonce pour proposer un échange.
              </p>
            </div>
            <Button asChild className="w-full">
              <a href="/publish">Publier une annonce</a>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection d'article */}
            <div className="space-y-2">
              <Label htmlFor="article-select">
                Article avec lequel vous désirez faire l'échange <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
                <SelectTrigger id="article-select">
                  <SelectValue placeholder="Sélectionner un article..." />
                </SelectTrigger>
                <SelectContent>
                  {userListings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email pour être contacté <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={contactEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+229 XX XX XX XX"
                value={contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">*</span> Champ obligatoire
            </p>

            {/* Boutons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedArticleId || (!contactEmail && !contactPhone)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Envoi en cours...
                  </span>
                ) : (
                  'Proposer l\'échange'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
