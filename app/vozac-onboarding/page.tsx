'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Upload, CheckCircle2, Shield } from 'lucide-react'

export default function VozacOnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [uploadingNapred, setUploadingNapred] = useState(false)
  const [uploadingPozadi, setUploadingPozadi] = useState(false)
  const [saglasnost, setSaglasnost] = useState(false)
  const [formData, setFormData] = useState({
    ime: '',
    prezime: '',
    telefon: '',
    grad: '',
    opis: '',
    saobracajna_napred: '',
    saobracajna_pozadi: '',
  })
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      console.log('🔍 VOZAC-ONBOARDING: Checking profile...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('❌ VOZAC-ONBOARDING: No user, redirecting to /prijava')
        router.push('/prijava')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('profil_popunjen, uloga')
        .eq('id', user.id)
        .single()

      console.log('📋 VOZAC-ONBOARDING: Profile data:', profile)

      // ✅ NE proveravaj uloga - može biti NULL! (postavlja se tek na submit)
      
      // Ako je već popunio profil, redirect na dashboard
      if (profile?.profil_popunjen && profile?.uloga === 'vozac') {
        console.log('✅ VOZAC-ONBOARDING: Profile already complete, redirecting to /vozac')
        router.push('/vozac')
      }
    }
    checkProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImageUpload = async (
    file: File, 
    side: 'napred' | 'pozadi'
  ): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email) throw new Error('Niste prijavljeni')

      // Kreiraj jedinstveno ime fajla sa email-om kao folder
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.email}/dozvola-${side}-${Date.now()}.${fileExt}`

      console.log('📤 Uploading:', fileName)

      // Upload u Supabase Storage
      const { data, error } = await supabase.storage
        .from('saobracajne-dozvole')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      // Vrati URL slike
      const { data: { publicUrl } } = supabase.storage
        .from('saobracajne-dozvole')
        .getPublicUrl(fileName)

      console.log('✅ Uploaded:', publicUrl)
      return data.path

    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Greška',
        description: `Greška pri upload-u slike: ${error.message}`,
        variant: 'destructive',
      })
      return null
    }
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'napred' | 'pozadi'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validacija tipa fajla
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Greška',
        description: 'Molimo uploadujte sliku (JPEG, PNG, itd.)',
        variant: 'destructive',
      })
      return
    }

    // Validacija veličine (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Greška',
        description: 'Slika je prevelika. Maksimalna veličina je 5MB.',
        variant: 'destructive',
      })
      return
    }

    if (side === 'napred') {
      setUploadingNapred(true)
    } else {
      setUploadingPozadi(true)
    }

    const path = await handleImageUpload(file, side)
    
    if (path) {
      setFormData(prev => ({
        ...prev,
        [`saobracajna_${side}`]: path
      }))
      toast({
        title: 'Uspešno!',
        description: `Slika ${side === 'napred' ? 'prednje' : 'zadnje'} strane uploadovana.`,
      })
    }

    if (side === 'napred') {
      setUploadingNapred(false)
    } else {
      setUploadingPozadi(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validacija
      if (!formData.saobracajna_napred || !formData.saobracajna_pozadi) {
        toast({
          title: 'Greška',
          description: 'Molimo uploadujte obe slike saobraćajne dozvole.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      if (!saglasnost) {
        toast({
          title: 'Greška',
          description: 'Morate prihvatiti obradu podataka da biste nastavili.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: 'Greška',
          description: 'Niste prijavljeni.',
          variant: 'destructive',
        })
        return
      }

      // TEK SADA postavi uloga = 'vozac' + svi podaci + slike
      const { error } = await supabase
        .from('users')
        .update({
          uloga: 'vozac',  // ✅ TEK SADA postavi uloga!
          ime: formData.ime,
          prezime: formData.prezime,
          puno_ime: `${formData.ime} ${formData.prezime}`,
          telefon: formData.telefon,
          grad: formData.grad,
          opis: formData.opis,
          saobracajna_napred: formData.saobracajna_napred,
          saobracajna_pozadi: formData.saobracajna_pozadi,
          profil_popunjen: true,
        })
        .eq('id', user.id)

      if (error) throw error

      // Očisti sessionStorage
      sessionStorage.removeItem('selected_role')

      toast({
        title: 'Uspešno!',
        description: 'Profil je popunjen. Dobrodošli!',
      })

      router.push('/vozac')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/select-role')}
              type="button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nazad
            </Button>
          </div>
          <CardTitle className="text-3xl">Popunite vaš profil - Vozač</CardTitle>
          <CardDescription>
            Pre nego što nastavite, potrebno je da popunite osnovne informacije
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ime">Ime *</Label>
                <Input
                  id="ime"
                  placeholder="Marko"
                  value={formData.ime}
                  onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prezime">Prezime *</Label>
                <Input
                  id="prezime"
                  placeholder="Marković"
                  value={formData.prezime}
                  onChange={(e) => setFormData({ ...formData, prezime: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefon">Broj telefona *</Label>
                <Input
                  id="telefon"
                  type="tel"
                  placeholder="+381 60 123 4567"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grad">Grad *</Label>
                <Input
                  id="grad"
                  placeholder="Beograd"
                  value={formData.grad}
                  onChange={(e) => setFormData({ ...formData, grad: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opis">Kratak opis *</Label>
              <Textarea
                id="opis"
                placeholder="Opišite vaše iskustvo u prevozu, tip vozila kojim raspolažete..."
                value={formData.opis}
                onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                required
                disabled={loading}
                rows={4}
              />
            </div>

            {/* Saobraćajna dozvola sekcija */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Saobraćajna dozvola</h3>
                  <p className="text-sm text-gray-500">Fotografije prednje i zadnje strane</p>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-2">O zaštiti vaših podataka:</p>
                    <p className="leading-relaxed">
                      <strong>TransLink</strong> koristi fotografiju vaše saobraćajne dozvole <strong>isključivo radi provere verodostojnosti naloga</strong> i sprečavanja zloupotreba (višestrukih registracija).
                    </p>
                    <p className="mt-2 leading-relaxed">
                      Podaci se čuvaju bezbedno i <strong>ne dele se sa trećim licima</strong>. Slanjem fotografije saglasni ste sa ovim uslovima.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Napred */}
              <div className="space-y-2">
                <Label htmlFor="saobracajna-napred" className="text-base">
                  Prednja strana dozvole *
                </Label>
                <div className="flex items-center gap-3">
                  <label 
                    htmlFor="saobracajna-napred"
                    className={`
                      flex-1 flex items-center justify-center gap-3 
                      border-2 border-dashed rounded-lg p-6 cursor-pointer
                      transition-all hover:border-primary hover:bg-primary/5
                      ${formData.saobracajna_napred ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                      ${uploadingNapred ? 'opacity-50 cursor-wait' : ''}
                    `}
                  >
                    {uploadingNapred ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-sm font-medium">Uploadovanje...</span>
                      </>
                    ) : formData.saobracajna_napred ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Prednja strana uploadovana ✓</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Kliknite da uploadujete sliku</span>
                      </>
                    )}
                  </label>
                  <Input
                    id="saobracajna-napred"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'napred')}
                    disabled={loading || uploadingNapred}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  JPEG, PNG ili WebP. Maksimalna veličina: 5MB
                </p>
              </div>

              {/* Upload Pozadi */}
              <div className="space-y-2">
                <Label htmlFor="saobracajna-pozadi" className="text-base">
                  Zadnja strana dozvole *
                </Label>
                <div className="flex items-center gap-3">
                  <label 
                    htmlFor="saobracajna-pozadi"
                    className={`
                      flex-1 flex items-center justify-center gap-3 
                      border-2 border-dashed rounded-lg p-6 cursor-pointer
                      transition-all hover:border-primary hover:bg-primary/5
                      ${formData.saobracajna_pozadi ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                      ${uploadingPozadi ? 'opacity-50 cursor-wait' : ''}
                    `}
                  >
                    {uploadingPozadi ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-sm font-medium">Uploadovanje...</span>
                      </>
                    ) : formData.saobracajna_pozadi ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Zadnja strana uploadovana ✓</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Kliknite da uploadujete sliku</span>
                      </>
                    )}
                  </label>
                  <Input
                    id="saobracajna-pozadi"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'pozadi')}
                    disabled={loading || uploadingPozadi}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  JPEG, PNG ili WebP. Maksimalna veličina: 5MB
                </p>
              </div>

              {/* Checkbox za saglasnost */}
              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg border">
                <Checkbox
                  id="saglasnost"
                  checked={saglasnost}
                  onCheckedChange={(checked) => setSaglasnost(checked as boolean)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <label
                    htmlFor="saglasnost"
                    className="text-sm font-medium leading-relaxed cursor-pointer"
                  >
                    Saglasan sam sa obradom ovih podataka u navedene svrhe. *
                  </label>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || uploadingNapred || uploadingPozadi || !saglasnost || !formData.saobracajna_napred || !formData.saobracajna_pozadi}
              className="w-full"
              size="lg"
            >
              {loading ? 'Čuvanje...' : 'Sačuvaj i nastavi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

