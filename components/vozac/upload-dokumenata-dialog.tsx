'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, FileImage, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface UploadDokumenataDialogProps {
  userId: string
  postojecaNapred?: string | null
  postojecaNazad?: string | null
}

export function UploadDokumenataDialog({ userId, postojecaNapred, postojecaNazad }: UploadDokumenataDialogProps) {
  const [open, setOpen] = useState(false)
  const [uploadingNapred, setUploadingNapred] = useState(false)
  const [uploadingNazad, setUploadingNazad] = useState(false)
  const [uploadedNapred, setUploadedNapred] = useState(!!postojecaNapred)
  const [uploadedNazad, setUploadedNazad] = useState(!!postojecaNazad)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleUploadNapred = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Greška',
        description: 'Molimo uploadujte sliku (JPG, PNG).',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Greška',
        description: 'Slika ne sme biti veća od 5MB.',
        variant: 'destructive',
      })
      return
    }

    setUploadingNapred(true)

    try {
      // Dobavi trenutnog korisnika za email
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email) throw new Error('Niste prijavljeni')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.email}/dozvola-napred-${Date.now()}.${fileExt}`

      // Upload kao u registraciji
      const { data, error: uploadError } = await supabase.storage
        .from('saobracajne-dozvole')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Čuvaj PATH (ne full URL) kao u registraciji
      const { error: updateError } = await supabase
        .from('users')
        .update({ saobracajna_napred: data.path })
        .eq('id', userId)

      if (updateError) throw updateError

      setUploadedNapred(true)
      
      toast({
        title: '✅ Uspešno!',
        description: 'Saobracajna dozvola (napred) je uploadovana.',
      })

      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške pri upload-u.',
        variant: 'destructive',
      })
    } finally {
      setUploadingNapred(false)
    }
  }

  const handleUploadNazad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Greška',
        description: 'Molimo uploadujte sliku (JPG, PNG).',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Greška',
        description: 'Slika ne sme biti veća od 5MB.',
        variant: 'destructive',
      })
      return
    }

    setUploadingNazad(true)

    try {
      // Dobavi trenutnog korisnika za email
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email) throw new Error('Niste prijavljeni')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.email}/dozvola-pozadi-${Date.now()}.${fileExt}`

      // Upload kao u registraciji
      const { data, error: uploadError } = await supabase.storage
        .from('saobracajne-dozvole')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Čuvaj PATH (ne full URL) kao u registraciji
      const { error: updateError } = await supabase
        .from('users')
        .update({ saobracajna_pozadi: data.path })
        .eq('id', userId)

      if (updateError) throw updateError

      setUploadedNazad(true)
      
      toast({
        title: '✅ Uspešno!',
        description: 'Saobracajna dozvola (nazad) je uploadovana.',
      })

      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške pri upload-u.',
        variant: 'destructive',
      })
    } finally {
      setUploadingNazad(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Upload className="h-4 w-4" />
          Upload dokumenata
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Upload saobracajne dozvole
          </DialogTitle>
          <DialogDescription>
            Uploadujte fotografije vaše saobracajne dozvole (napred i nazad). 
            Slike moraju biti jasne i čitljive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Napred */}
          <div className="space-y-2">
            <h4 className="font-semibold">Prednja strana dozvole</h4>
            <label 
              htmlFor="upload-napred"
              className={`
                flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 
                border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer
                transition-all hover:border-primary hover:bg-primary/5 min-h-[80px] sm:min-h-0
                ${uploadedNapred ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                ${uploadingNapred ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              {uploadingNapred ? (
                <>
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-center">Uploadovanje...</span>
                </>
              ) : uploadedNapred ? (
                <>
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-green-700 text-center">Prednja strana uploadovana ✓</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600 text-center">Kliknite da uploadujete sliku</span>
                </>
              )}
            </label>
            <input
              id="upload-napred"
              type="file"
              accept="image/*"
              onChange={handleUploadNapred}
              disabled={uploadingNapred}
              className="hidden"
            />
            <p className="text-xs text-gray-500">JPEG, PNG ili WebP. Maksimalna veličina: 5MB</p>
          </div>

          {/* Nazad */}
          <div className="space-y-2">
            <h4 className="font-semibold">Zadnja strana dozvole</h4>
            <label 
              htmlFor="upload-nazad"
              className={`
                flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 
                border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer
                transition-all hover:border-primary hover:bg-primary/5 min-h-[80px] sm:min-h-0
                ${uploadedNazad ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                ${uploadingNazad ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              {uploadingNazad ? (
                <>
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-center">Uploadovanje...</span>
                </>
              ) : uploadedNazad ? (
                <>
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-green-700 text-center">Zadnja strana uploadovana ✓</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600 text-center">Kliknite da uploadujete sliku</span>
                </>
              )}
            </label>
            <input
              id="upload-nazad"
              type="file"
              accept="image/*"
              onChange={handleUploadNazad}
              disabled={uploadingNazad}
              className="hidden"
            />
            <p className="text-xs text-gray-500">JPEG, PNG ili WebP. Maksimalna veličina: 5MB</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Napomena:</strong> Nakon upload-a, dokumenta će biti pregledana od strane administratora. 
              Vaš nalog će biti verifikovan nakon što administrator potvrdi autentičnost dokumenata.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

