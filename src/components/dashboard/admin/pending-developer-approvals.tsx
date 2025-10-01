'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export function PendingDeveloperApprovals({ pendingDevelopers }) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const handleApprove = async (developerId: string) => {
    setProcessingIds(prev => new Set(prev).add(developerId))
    
    try {
      const response = await fetch('/api/admin/developers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developerId,
          approved: 'approved'
        })
      })
      
      if (response.ok) {
        toast.success('Developer approved successfully')
        // Refresh the current page
        fetchPendingDevelopers()
      } else {
        toast.error('Failed to approve developer')
      }
    } catch (error) {
      toast.error('Error approving developer')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(developerId)
        return newSet
      })
    }
  }

  const handleReject = async (developerId: string) => {
    setProcessingIds(prev => new Set(prev).add(developerId))
    
    try {
      const response = await fetch('/api/admin/developers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developerId,
          approved: 'rejected'
        })
      })
      
      if (response.ok) {
        toast.success('Developer rejected')
        // Refresh the current page
        fetchPendingDevelopers()
      } else {
        toast.error('Failed to reject developer')
      }
    } catch (error) {
      toast.error('Error rejecting developer')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(developerId)
        return newSet
      })
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Developer Approvals</CardTitle>
        <Button asChild size="sm">
          <Link href="/admin/developers">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {pendingDevelopers && pendingDevelopers.length > 0 ? (
          <div className="space-y-4">
            {pendingDevelopers.slice(0, 3).map((dev) => (
              <div key={dev.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {dev.displayName}
                  </div>
                  <div className="text-sm text-muted-foreground">{dev.email}</div>
                  {dev.headline && (
                    <div className="text-xs text-muted-foreground mt-1">{dev.headline}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleApprove(dev.profileId)}
                    disabled={processingIds.has(dev.profileId)}
                    size="sm" variant="outline"
                  >
                    <UserCheck className="h-3 w-3" />
                    {processingIds.has(dev.profileId) ? 'Approving...' : ''}
                  </Button>
                  <Button 
                    OnClick={() => handleReject(dev.profileId)}
                    desabled={processingIds.has(dev.profileId)}
                    size="sm" variant="outline"
                  >
                    <UserX className="h-3 w-3" />
                    {processingIds.has(dev.profileId) ? 'Rejecting...' : ''}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <p className="text-muted-foreground text-center py-4">No pending approvals</p>
          )}
      </CardContent>
    </Card>
  )
}
