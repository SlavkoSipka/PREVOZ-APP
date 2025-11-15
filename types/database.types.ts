export type Uloga = 'vozac' | 'poslodavac' | 'admin'
export type StatusTure = 'aktivna' | 'na_cekanju' | 'dodeljena' | 'zavrsena' | 'odbijena'
export type StatusPrijave = 'ceka_admina' | 'odobreno' | 'odbijeno' | 'zavrseno'
export type StatusUplate = 'u_toku' | 'placeno' | 'neuspesno'

export interface User {
  id: string
  uloga: Uloga | null
  email: string
  puno_ime: string
  telefon: string
  naziv_firme?: string | null
  registarske_tablice?: string | null
  saobracajna_napred?: string | null
  saobracajna_pozadi?: string | null
  saobracajna_prihvacena?: boolean
  verifikovan: boolean
  blokiran: boolean
  profil_popunjen: boolean
  created_at: string
  updated_at: string
}

export interface Tura {
  id: string
  firma_id: string
  polazak: string
  destinacija: string
  datum: string
  opis_robe: string
  ponudjena_cena: number
  status: StatusTure
  dodeljeni_vozac_id?: string | null
  created_at: string
  firma?: User
  vozac?: User
}

export interface Prijava {
  id: string
  tura_id: string
  vozac_id: string
  status: StatusPrijave
  created_at: string
  tura?: Tura
  vozac?: User
}

export interface Uplata {
  id: string
  vozac_id: string
  tura_id: string
  iznos: number
  status: StatusUplate
  created_at: string
  tura?: Tura
  vozac?: User
}

export interface Notifikacija {
  id: string
  user_id: string
  naslov: string
  poruka: string
  procitano: boolean
  created_at: string
}

export interface Ocena {
  id: string
  tura_id: string
  vozac_id: string
  poslodavac_id: string
  ocena: number
  komentar?: string | null
  created_at: string
  poslodavac?: {
    puno_ime: string
    naziv_firme?: string | null
  }
  tura?: {
    polazak: string
    destinacija: string
    datum: string
  }
}

