import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role klijent za admin operacije
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Provera da li je test mode aktivan
  const testMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'
  
  if (!testMode) {
    return NextResponse.json(
      { error: 'Test plaćanje je dostupno samo u test modu' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { vozac_id, uplate_ids, iznos } = body

    console.log('🧪 Test payment simulation:', { vozac_id, uplate_ids, iznos })

    // Validacija
    if (!vozac_id || !uplate_ids || uplate_ids.length === 0) {
      return NextResponse.json(
        { error: 'Nedostaju potrebni parametri' },
        { status: 400 }
      )
    }

    // 1. Ažuriranje uplata na "placeno"
    const { error: uplateError } = await supabase
      .from('uplate')
      .update({ 
        status: 'placeno',
        checkout_id: `TEST_${Date.now()}` // Mock transaction ID
      })
      .in('id', uplate_ids)
      .eq('vozac_id', vozac_id)

    if (uplateError) {
      console.error('Error updating uplate:', uplateError)
      return NextResponse.json(
        { error: 'Greška pri ažuriranju uplata' },
        { status: 500 }
      )
    }

    // 2. Deblokiranje vozača
    const { error: userError } = await supabase
      .from('users')
      .update({ blokiran: false })
      .eq('id', vozac_id)

    if (userError) {
      console.error('Error unblocking user:', userError)
      return NextResponse.json(
        { error: 'Greška pri deblokiranju naloga' },
        { status: 500 }
      )
    }

    // 3. Kreiranje notifikacije
    await supabase.rpc('create_notification', {
      p_user_id: vozac_id,
      p_naslov: '✅ Test plaćanje uspešno!',
      p_poruka: `Test plaćanje od ${iznos}€ je uspešno simulirano. Vaš nalog je ponovo aktivan.`
    })

    console.log('✅ Test payment successful for user:', vozac_id)

    return NextResponse.json({ 
      success: true,
      message: 'Test plaćanje uspešno simulirano',
      transaction_id: `TEST_${Date.now()}`
    })

  } catch (error: any) {
    console.error('Test payment error:', error)
    return NextResponse.json(
      { error: 'Greška pri obradi test plaćanja', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint za proveru
export async function GET() {
  const testMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'
  
  return NextResponse.json({ 
    message: 'Test payment endpoint',
    test_mode: testMode,
    status: testMode ? 'active' : 'disabled'
  })
}

