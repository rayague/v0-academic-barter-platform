import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const paymentId = searchParams.get('payment_id')
    const listingId = searchParams.get('listing_id')

    if (!paymentId && !listingId) {
      return NextResponse.json(
        { error: 'payment_id ou listing_id requis' },
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

    let query = supabase
      .from('payments')
      .select('id, status, provider_payment_id, listing_id')
      .eq('user_id', user.id)

    if (paymentId) {
      query = query.eq('id', paymentId)
    } else if (listingId) {
      query = query.eq('listing_id', listingId)
    }

    const { data: payment, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Paiement non trouvé' },
        { status: 404 }
      )
    }

    // Si le paiement est complété, vérifier que le listing est actif
    let listingActive = false
    if (payment.status === 'completed' && payment.listing_id) {
      const { data: listing } = await supabase
        .from('listings')
        .select('status')
        .eq('id', payment.listing_id)
        .single()
      listingActive = listing?.status === 'active'
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: payment.status,
        provider_payment_id: payment.provider_payment_id,
      },
      listingActive,
    })

  } catch (err) {
    console.error('Erreur status payment:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}