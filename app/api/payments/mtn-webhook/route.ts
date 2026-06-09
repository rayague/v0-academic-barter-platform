import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      transaction_id,
      status,
      amount,
      phone_number,
      reference,
    } = body

    if (!transaction_id || !reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, status, user_id, listing_id')
      .eq('provider_payment_id', transaction_id)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found for transaction:', transaction_id)
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.status === 'completed' || payment.status === 'failed') {
      return NextResponse.json({ message: 'Already processed' })
    }

    if (status !== 'success' && status !== 'failed') {
      return NextResponse.json({ message: 'Transient status, ignoring' })
    }

    const newStatus = status === 'success' ? 'completed' : 'failed'

    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    if (newStatus === 'completed' && payment.listing_id) {
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
          console.error('Error activating listing:', listingError)
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
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}