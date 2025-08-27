"use client"

import { useState, useEffect } from "react"
import { useMinIOConfig } from "@/hooks/use-minio-config"
import { listBuckets, createMinIOClient, createBucket, deleteBucket, getBucketLocation, listObjects } from "@/lib/minio-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BucketStats } from "@/components/buckets/bucket-stats"
import {
  ServerIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  FolderIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import type { BucketInfo } from "@/types/minio"

interface ExtendedBucketInfo extends BucketInfo {
  location?: string
  objectCount?: number
  totalSize?: number
}

export default function BucketsPage() {
  const { config, hasConfig } = useMinIOConfig()
  const [buckets, setBuckets] = useState<ExtendedBucketInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBucketName, setNewBucketName] = useState("")
  const [newBucketRegion, setNewBucketRegion] = useState("us-east-1")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (hasConfig && config) {
      loadBuckets()
    }
  }, [hasConfig, config])

  const loadBuckets = async () => {
    if (!config) return

    setIsLoading(true)
    setError("")

    try {
      createMinIOClient(config)
      const bucketList = await listBuckets()

      // Enhance bucket info with additional details
      const enhancedBuckets = await Promise.all(
        bucketList.map(async (bucket) => {
          let location = "unknown"
          let objectCount = 0
          let totalSize = 0
          try {
            location = await getBucketLocation(bucket.name)
          } catch {}
          try {
            // List all objects in the bucket and sum their sizes
            const objects = await listObjects(bucket.name)
            objectCount = objects.length
            totalSize = objects.reduce((sum, obj) => sum + (obj.size || 0), 0)
          } catch {}
          return { ...bucket, location, objectCount, totalSize: totalSize / (1024 * 1024) } // MB as number
        }),
      )

      setBuckets(enhancedBuckets)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load buckets")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBucket = async () => {
    if (!newBucketName.trim() || !config) return

    setIsCreating(true)
    try {
      createMinIOClient(config)
      await createBucket(newBucketName.trim(), newBucketRegion)
      setIsCreateDialogOpen(false)
      setNewBucketName("")
      setNewBucketRegion("us-east-1")
      await loadBuckets()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create bucket")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteBucket = async (bucketName: string) => {
    if (!confirm(`Are you sure you want to delete bucket "${bucketName}"? This action cannot be undone.`)) {
      return
    }

    if (!config) return

    try {
      createMinIOClient(config)
      await deleteBucket(bucketName)
      await loadBuckets()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete bucket")
    }
  }

  const validateBucketName = (name: string): boolean => {
    // MinIO bucket naming rules
    const bucketNameRegex = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/
    return name.length >= 3 && name.length <= 63 && bucketNameRegex.test(name)
  }

  if (!hasConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ServerIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>No Configuration Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-center">Please configure your MinIO connection first.</p>
            <Link href="/settings">
              <Button className="w-full">
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Go to Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <ServerIcon className="h-8 w-8 mr-3 text-primary" />
              Buckets
            </h1>
            <p className="text-muted-foreground mt-2">Manage your MinIO storage buckets</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Bucket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bucket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bucketName">Bucket Name *</Label>
                  <Input
                    id="bucketName"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value.toLowerCase())}
                    placeholder="my-bucket-name"
                  />
                  {newBucketName && !validateBucketName(newBucketName) && (
                    <p className="text-xs text-red-600 mt-1">
                      Bucket name must be 3-63 characters, lowercase, and contain only letters, numbers, dots, and
                      hyphens
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bucketRegion">Region</Label>
                  <Input
                    id="bucketRegion"
                    value={newBucketRegion}
                    onChange={(e) => setNewBucketRegion(e.target.value)}
                    placeholder="us-east-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateBucket}
                    disabled={!newBucketName.trim() || !validateBucketName(newBucketName) || isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Bucket"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bucket Stats Overview */}
      <BucketStats buckets={buckets} />

      {/* Buckets Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading buckets...</p>
          </CardContent>
        </Card>
      ) : buckets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buckets.map((bucket) => (
            <Card key={bucket.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ServerIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{bucket.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/files?bucket=${bucket.name}`}>
                          <FolderIcon className="h-4 w-4 mr-2" />
                          Browse Files
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteBucket(bucket.name)} className="text-destructive">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Bucket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
               <CardDescription>
  Created {new Date(bucket.creationDate).toLocaleDateString()}
</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Region:</span>
                    <Badge variant="secondary">{bucket.location || "unknown"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Objects:</span>
                    <span>{bucket.objectCount || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span>
                      {typeof bucket.totalSize === "number"
                        ? `${bucket.totalSize.toFixed(2)} MB`
                        : "—"}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link href={`/files?bucket=${bucket.name}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        <FolderIcon className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <ServerIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No buckets found</h3>
            <p className="text-muted-foreground mb-4">Create your first bucket to start storing files</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Bucket
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2 text-primary" />
            Bucket Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Naming Rules</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 3-63 characters long</li>
                <li>• Lowercase letters, numbers, dots, hyphens</li>
                <li>• Must start and end with letter or number</li>
                <li>• No consecutive dots or hyphens</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use descriptive names</li>
                <li>• Consider data locality for regions</li>
                <li>• Empty buckets before deletion</li>
                <li>• Use consistent naming conventions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
