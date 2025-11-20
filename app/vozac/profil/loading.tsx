import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Skeleton */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-20 w-20 rounded-full bg-white/20" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2 bg-white/20" />
              <Skeleton className="h-5 w-32 bg-white/20" />
            </div>
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4">
                <Skeleton className="h-6 w-6 mb-2 bg-white/20" />
                <Skeleton className="h-8 w-16 mb-1 bg-white/20" />
                <Skeleton className="h-4 w-24 bg-white/20" />
              </div>
            ))}
          </div>
        </div>

        {/* Profile Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

