"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerIcon, FolderIcon, ChartBarIcon } from "@heroicons/react/24/outline"

interface BucketInfo {
  name: string
  creationDate: Date
  location?: string
  objectCount?: number
  totalSize?: number
}

interface BucketStatsProps {
  buckets: BucketInfo[]
}

export function BucketStats({ buckets }: BucketStatsProps) {
  const totalBuckets = buckets.length
  const totalObjects = buckets.reduce((sum, bucket) => sum + (bucket.objectCount || 0), 0)
  const totalSize = buckets.reduce((sum, bucket) => sum + (bucket.totalSize || 0), 0)

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const regionStats = buckets.reduce(
    (acc, bucket) => {
      const region = bucket.location || "unknown"
      acc[region] = (acc[region] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topRegion = Object.entries(regionStats).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Buckets</CardTitle>
          <ServerIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBuckets}</div>
          <p className="text-xs text-muted-foreground">{totalBuckets === 1 ? "bucket" : "buckets"} configured</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Objects</CardTitle>
          <FolderIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalObjects.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">files across all buckets</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
          <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatSize(totalSize * 1024 * 1024)}</div>
          <p className="text-xs text-muted-foreground">used storage space</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Primary Region</CardTitle>
          <ServerIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topRegion?.[0] || "—"}</div>
          <p className="text-xs text-muted-foreground">
            {topRegion ? `${topRegion[1]} ${topRegion[1] === 1 ? "bucket" : "buckets"}` : "no buckets"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
