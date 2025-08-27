"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useMinIOConfig } from "@/hooks/use-minio-config"
import { listBuckets, createMinIOClient } from "@/lib/minio-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileBrowser } from "@/components/file-browser/file-browser"
import { FolderIcon, MagnifyingGlassIcon, Cog6ToothIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import type { BucketInfo } from "@/types/minio"

export default function FilesPage() {
  const { config, hasConfig } = useMinIOConfig()
  const searchParams = useSearchParams()
  const [buckets, setBuckets] = useState<BucketInfo[]>([])
  const [selectedBucket, setSelectedBucket] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (hasConfig && config) {
      loadBuckets()
    }
  }, [hasConfig, config])

  useEffect(() => {
    const bucketFromUrl = searchParams.get("bucket")
    if (bucketFromUrl && buckets.length > 0) {
      setSelectedBucket(bucketFromUrl)
    }
  }, [searchParams, buckets])

  const loadBuckets = async () => {
    if (!config) return

    setIsLoading(true)
    setError("")

    try {
      createMinIOClient(config)
      const bucketList = await listBuckets()
      setBuckets(bucketList)

      const bucketFromUrl = searchParams.get("bucket")
      if (bucketFromUrl && bucketList.some((b) => b.name === bucketFromUrl)) {
        setSelectedBucket(bucketFromUrl)
      } else if (bucketList.length > 0 && !selectedBucket) {
        setSelectedBucket(bucketList[0].name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load buckets")
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <FolderIcon className="h-12 w-12 text-primary mx-auto mb-4" />
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
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <FolderIcon className="h-8 w-8 mr-3 text-primary" />
          Files
        </h1>
        <p className="text-muted-foreground mt-2">Browse and manage your MinIO files</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Bucket Selection */}
            <div className="flex-1">
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bucket" />
                </SelectTrigger>
                <SelectContent>
                  {buckets.map((bucket) => (
                    <SelectItem key={bucket.name} value={bucket.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{bucket.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {bucket.creationDate && !isNaN(new Date(bucket.creationDate).getTime())
                              ? new Date(bucket.creationDate).toLocaleString()
                                                                       : ""}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={loadBuckets} disabled={isLoading} variant="outline" className="bg-transparent">
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Browser */}
      {selectedBucket && <FileBrowser bucketName={selectedBucket} searchQuery={searchQuery} config={config!} />}

      {buckets.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No buckets found. Create a bucket first.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
