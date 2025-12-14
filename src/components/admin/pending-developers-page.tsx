'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { UserCheck, UserX, Search, ArrowLeft, Calendar, Mail, User, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface PendingDeveloper {
  profileId: string
  displayName: string
  userEmail: string
  profileCreatedAt: string
  headline?: string
  bio?: string
  country?: string
  rate?: number
  availability?: string
  skills?: Array<{
    skillId: string
    skillSlug: string
    skillLabel: string
    level: string
  }>
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function PendingDevelopersPage({ adminProfile, user }) {
  const [developers, setDevelopers] = useState<PendingDeveloper[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPendingDevelopers()
  }, [pagination.page])

  const fetchPendingDevelopers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: 'pending',
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      const response = await fetch(`/api/admin/developers?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setDevelopers(data.developers || [])
        setPagination(data.pagination)
      } else {
        toast.error('Failed to load pending developers')
      }
    } catch (error) {
      toast.error('Error loading developers')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

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

  // Filter developers based on search term (client-side filtering)
  const filteredDevelopers = developers.filter(dev => 
    dev.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dev.headline && dev.headline.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading && pagination.page === 1) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav role="admin" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading pending developers...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={{ 
        name: adminProfile.displayName, 
        email: user.email, 
        role: adminProfile.role 
      }} 
        role="admin" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Pending Developer Approvals</h1>
              <p className="text-muted-foreground">
                Review and approve developer applications ({pagination.total} total pending)
              </p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search developers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Developers List */}
        {filteredDevelopers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending developers</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No developers match your search criteria.' : 'All developer applications have been processed.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-4">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            )}
            
            {filteredDevelopers.map((developer) => (
              <Card key={developer.profileId}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium">{developer.displayName}</h3>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {developer.userEmail}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Applied {new Date(developer.profileCreatedAt).toLocaleDateString()}
                      </div>
                      
                      {developer.headline && (
                        <p className="text-sm font-medium text-foreground mt-2">
                          {developer.headline}
                        </p>
                      )}
                      
                      {developer.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {developer.bio}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {developer.country && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            📍 {developer.country}
                          </span>
                        )}
                        {developer.rate && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            ${developer.rate}/hr
                          </span>
                        )}
                        {developer.availability && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {developer.availability}
                          </span>
                        )}
                      </div>
                      
                      {developer.skills && developer.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {developer.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill.skillId} variant="outline" className="text-xs">
                              {skill.skillLabel}
                            </Badge>
                          ))}
                          {developer.skills.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{developer.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(developer.profileId)}
                        disabled={processingIds.has(developer.profileId)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {processingIds.has(developer.profileId) ? 'Approving...' : 'Approve'}
                      </Button>
                      
                      <Button
                        onClick={() => handleReject(developer.profileId)}
                        disabled={processingIds.has(developer.profileId)}
                        variant="destructive"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        {processingIds.has(developer.profileId) ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} developers
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, pagination.page - 2)
                  if (pageNum > pagination.totalPages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
