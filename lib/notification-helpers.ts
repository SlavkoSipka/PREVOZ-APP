/**
 * Helper funkcije za kreiranje notifikacija u bazi
 * Notifikacije se prikazuju samo u /notifikacije page-u
 */

import { createClient } from '@/lib/supabase/client'

export interface CreateNotificationOptions {
  userId: string
  tip: 'odobreno' | 'odbijeno' | 'nova_ocena' | 'uplata_potrebna' | 'admin_poruka' | 'tura_odobrena' | 'vozac_dodeljen' | 'tura_zavrsena'
  poruka: string
  turaId?: string
  prijavaId?: string
}

/**
 * Kreira notifikaciju u bazi (bez push notifikacija)
 */
export async function createNotificationWithPush(options: CreateNotificationOptions): Promise<boolean> {
  try {
    const supabase = createClient()

    // Kreiraj notifikaciju u bazi
    const { data: notifikacija, error: notifError } = await supabase
      .from('notifikacije')
      .insert({
        vozac_id: options.userId,
        tip: options.tip,
        poruka: options.poruka,
        tura_id: options.turaId || null,
        prijava_id: options.prijavaId || null,
        procitano: false
      })
      .select()
      .single()

    if (notifError) {
      console.error('❌ Greška pri kreiranju notifikacije:', notifError)
      return false
    }

    console.log('✅ Notifikacija kreirana:', notifikacija)
    return true
  } catch (error) {
    console.error('❌ Error u createNotificationWithPush:', error)
    return false
  }
}

/**
 * SERVER-SIDE verzija - za korišćenje u API route-ovima
 */
export async function createNotificationWithPushServer(
  options: CreateNotificationOptions,
  supabaseClient: any
): Promise<boolean> {
  try {
    // Kreiraj notifikaciju u bazi
    const { data: notifikacija, error: notifError } = await supabaseClient
      .from('notifikacije')
      .insert({
        vozac_id: options.userId,
        tip: options.tip,
        poruka: options.poruka,
        tura_id: options.turaId || null,
        prijava_id: options.prijavaId || null,
        procitano: false
      })
      .select()
      .single()

    if (notifError) {
      console.error('❌ Greška pri kreiranju notifikacije:', notifError)
      return false
    }

    console.log('✅ Notifikacija kreirana:', notifikacija)
    return true
  } catch (error) {
    console.error('❌ Error u createNotificationWithPushServer:', error)
    return false
  }
}

