import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId requis' },
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

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, status, user_id, listing_id')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Paiement non trouvé' },
        { status: 404 }
      )
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Ce paiement ne peut pas être confirmé' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Erreur confirmation paiement:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la confirmation du paiement' },
        { status: 500 }
      )
    }

    if (payment.listing_id) {
      const { data: listing } = await supabase
        .from('listings')
        .select('status, title')
        .eq('id', payment.listing_id)
        .single()

      if (listing?.status === 'pending_payment') {
        const { error: listingError } = await supabase
          .from('listings')
          .update({ status: 'active' })
          .eq('id', payment.listing_id)
          .eq('user_id', payment.user_id)

        if (listingError) {
          console.error('Erreur activation annonce:', listingError)
        } else {
          await supabase.from('notifications').insert({
            recipient_id: payment.user_id,
            type: 'listing_published',
            data: {
              listing_id: payment.listing_id,
              listing_title: listing?.title ?? '',
              payment_id: payment.id,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur simulation confirmation:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
