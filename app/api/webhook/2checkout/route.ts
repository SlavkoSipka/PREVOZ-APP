import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Kreiranje Supabase klijenta sa service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('2Checkout webhook received:', body)

    // Validacija webhook signature (opciono, preporučeno)
    // const signature = request.headers.get('x-2checkout-signature')
    // Ovde bi trebalo validirati signature sa secret key-em

    // Provera da li je plaćanje uspešno
    if (body.message_type === 'ORDER_CREATED' && body.sale?.status === 'success') {
      const customerId = body.sale?.customer_email || body.customer?.email
      const amount = parseFloat(body.sale?.total || 0)
      const transactionId = body.sale?.id || body.sale?.invoice_id

      // Pronalaženje neplaćenih uplata za korisnika
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerId)
        .single()

      if (!user) {
        console.error('User not found for email:', customerId)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Ažuriranje neplaćenih uplata na 'placeno'
      const { data: uplate, error: uplateError } = await supabase
        .from('uplate')
        .update({ 
          status: 'placeno',
          checkout_id: transactionId 
        })
        .eq('vozac_id', user.id)
        .eq('status', 'u_toku')

      if (uplateError) {
        console.error('Error updating uplate:', uplateError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      // Deblokiranje korisnika i brisanje razloga
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          blokiran: false,
          razlog_blokiranja: null,
          vreme_automatske_blokade: null
        })
        .eq('id', user.id)

      if (userError) {
        console.error('Error unblocking user:', userError)
      }

      // Kreiranje zahvalnice notifikacije
      await supabase
        .from('notifikacije')
        .insert({
          vozac_id: user.id,
          tip: 'uplata_potrebna',
          poruka: '✅ Hvala na uplati!\n\n🎉 Vaša provizija je uspešno plaćena. Cenimo vašu profesionalnost i pouzdanost! Želimo vam puno uspešnih tura i zadovoljnih klijenata. TransLink tim vas pozdravlja! 🚚'
        })

      console.log('Payment processed successfully for user:', user.id)

      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed' 
      })
    }

    // Ako je plaćanje neuspešno
    if (body.message_type === 'ORDER_CREATED' && body.sale?.status === 'failed') {
      const customerId = body.sale?.customer_email || body.customer?.email

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerId)
        .single()

      if (user) {
        await supabase
          .from('uplate')
          .update({ status: 'neuspesno' })
          .eq('vozac_id', user.id)
          .eq('status', 'u_toku')

        await supabase
          .from('notifikacije')
          .insert({
            vozac_id: user.id,
            tip: 'uplata_potrebna',
            poruka: '❌ Uplata neuspešna\n\nVaša uplata nije uspela. Molimo pokušajte ponovo ili kontaktirajte podršku.'
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint za testiranje
export async function GET() {
  return NextResponse.json({ 
    message: '2Checkout webhook endpoint',
    status: 'active' 
  })
}

