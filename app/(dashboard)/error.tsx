'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error:', error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border/50 bg-card p-8 shadow-lg">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Erreur du Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Une erreur est survenue lors du chargement du dashboard. Veuillez réessayer.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="space-y-2 rounded-lg bg-destructive/5 p-4">
            <p className="text-xs font-semibold text-destructive">Détails (Dev):</p>
            <pre className="overflow-auto rounded bg-muted p-2 text-xs text-muted-foreground">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => reset()}>
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild className="flex-1" variant="default">
            <Link href="/dashboard">Retour</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
