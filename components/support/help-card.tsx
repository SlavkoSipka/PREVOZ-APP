import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageCircle, HelpCircle } from 'lucide-react'

export function HelpCard() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <HelpCircle className="h-5 w-5" />
          Potrebna pomoć?
        </CardTitle>
        <CardDescription className="text-blue-700">
          Tu smo da vam pomognemo!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-blue-800">
          Ukoliko imate bilo kakvih tehničkih problema, pitanja ili vam je potrebna pomoć, kontaktirajte nas:
        </p>
        
        <div className="space-y-2">
          {/* Telefon */}
          <Button 
            asChild 
            variant="outline" 
            className="w-full justify-start bg-white hover:bg-blue-100 border-blue-300"
            size="sm"
          >
            <a href="tel:+381613091583">
              <Phone className="mr-2 h-4 w-4" />
              Pozovi: +381 61 309 1583
            </a>
          </Button>

          {/* SMS */}
          <Button 
            asChild 
            variant="outline" 
            className="w-full justify-start bg-white hover:bg-blue-100 border-blue-300"
            size="sm"
          >
            <a href="sms:+381613091583">
              <MessageCircle className="mr-2 h-4 w-4" />
              Pošalji SMS
            </a>
          </Button>

          {/* WhatsApp (opciono) */}
          <Button 
            asChild 
            variant="outline" 
            className="w-full justify-start bg-white hover:bg-green-100 border-green-300 text-green-700"
            size="sm"
          >
            <a href="https://wa.me/381613091583" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp poruka
            </a>
          </Button>
        </div>

        <div className="pt-2 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            💡 <strong>Radno vreme:</strong> Pon-Pet 08:00-20:00, Sub 09:00-17:00
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

