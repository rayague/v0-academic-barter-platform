import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, phoneNumber } = body

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId requis' },
        { status: 400 }
      )
    }

    if (!phoneNumber || !/^\+?\d{7,15}$/.test(phoneNumber.replace(/[\s\-]/g, ''))) {
      return NextResponse.json(
        { error: 'Numéro de téléphone MTN invalide' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, status, title')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      )
    }

    if (listing.status !== 'pending_payment') {
      return NextResponse.json(
        { error: 'Cette annonce ne nécessite pas de paiement' },
        { status: 400 }
      )
    }

    // Générer une référence unique pour MTN
    const providerPaymentId = `MTN_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Créer le paiement en attente
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        listing_id: listingId,
        amount: 1,
        currency: 'XOF',
        status: 'pending',
        provider: 'mtn',
        provider_payment_id: providerPaymentId,
      })
      .select('id')
      .single()

    if (paymentError) {
      console.error('Erreur création paiement:', paymentError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement' },
        { status: 500 }
      )
    }

    // TODO: Appel réel à l'API MTN Mobile Money
    // Pour l'instant, on simule la réponse MTN
    // En production, remplacer par :
    /*
    const mtnResponse = await fetch('https://api.mtn.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MTN_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Target-Environment': 'mtn-benin',
      },
      body: JSON.stringify({
        amount: '1',
        currency: 'XOF',
        externalId: providerPaymentId,
        payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
        payerMessage: `Paiement publication: ${listing.title}`,
        payeeNote: 'Microtaxe DYO',
      }),
    })
    const mtnData = await mtnResponse.json()
    */

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      providerPaymentId: providerPaymentId,
      message: 'Demande de paiement envoyée. Vérifiez votre téléphone MTN.'
    })

  } catch (err) {
    console.error('Erreur initiate MTN:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}