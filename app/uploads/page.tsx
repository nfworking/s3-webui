"use client"

import { useEffect, useState, useCallback } from "react"
import { useMinIOConfig } from "@/hooks/use-minio-config"
import { listBuckets, createMinIOClient, uploadFile } from "@/lib/minio-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUploadZone } from "@/components/upload/file-upload-zone"
import { UploadQueue } from "@/components/upload/upload-queue"
import { CloudArrowUpIcon, Cog6ToothIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import type { BucketInfo, UploadProgress } from "@/types/minio"

interface UploadItem {
  id: string
  file: File
  bucketName: string
  objectName: string
  status: "pending" | "uploading" | "completed" | "error"
  progress: UploadProgress
  error?: string
}

export default function UploadsPage() {
  const { config, hasConfig } = useMinIOConfig()
  const [buckets, setBuckets] = useState<BucketInfo[]>([])
  const [selectedBucket, setSelectedBucket] = useState<string>("")
  const [uploadPath, setUploadPath] = useState<string>("")
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])
  const [isLoadingBuckets, setIsLoadingBuckets] = useState(false)
  const [error, setError] = useState<string>("")

  const loadBuckets = useCallback(async () => {
    if (!config) return

    setIsLoadingBuckets(true)
    setError("")

    try {
      createMinIOClient(config)
      const bucketList = await listBuckets()
      setBuckets(bucketList)
      if (bucketList.length > 0 && !selectedBucket) {
        setSelectedBucket(bucketList[0].name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load buckets")
    } finally {
      setIsLoadingBuckets(false)
    }
  }, [config, selectedBucket])

  const handleFilesSelected = (files: File[]) => {
    const newUploads: UploadItem[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      bucketName: selectedBucket,
      objectName: uploadPath ? `${uploadPath}/${file.name}` : file.name,
      status: "pending",
      progress: { loaded: 0, total: file.size, percentage: 0 },
    }))

    setUploadQueue((prev) => [...prev, ...newUploads])
  }

  const startUpload = async (uploadItem: UploadItem) => {
    if (!config) return

    setUploadQueue((prev) => prev.map((item) => (item.id === uploadItem.id ? { ...item, status: "uploading" } : item)))

    try {
      createMinIOClient(config)
      await uploadFile(uploadItem.bucketName, uploadItem.objectName, uploadItem.file, (progress) => {
        setUploadQueue((prev) => prev.map((item) => (item.id === uploadItem.id ? { ...item, progress } : item)))
      })

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, status: "completed", progress: { ...item.progress, percentage: 100 } }
            : item,
        ),
      )
    } catch (error) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? {
                ...item,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : item,
        ),
      )
    }
  }

  const startAllUploads = async () => {
    const pendingUploads = uploadQueue.filter((item) => item.status === "pending")
    for (const upload of pendingUploads) {
      await startUpload(upload)
    }
  }

  const clearCompleted = () => {
    setUploadQueue((prev) => prev.filter((item) => item.status !== "completed"))
  }

  const removeUpload = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id))
  }

  // Load buckets when component mounts and config is available
  useEffect(() => {
    if (hasConfig && config) {
      loadBuckets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasConfig, config])

  if (!hasConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CloudArrowUpIcon className="h-12 w-12 text-primary mx-auto mb-4" />
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
          <CloudArrowUpIcon className="h-8 w-8 mr-3 text-primary" />
          Upload Files
        </h1>
        <p className="text-muted-foreground mt-2">Upload files to your MinIO storage</p>
      </div>

      <div className="space-y-6">
        {/* Upload Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bucket">Target Bucket</Label>
                <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    {buckets.map((bucket) => (
                      <SelectItem key={bucket.name} value={bucket.name}>
                        {bucket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="path">Upload Path (optional)</Label>
                <Input
                  id="path"
                  placeholder="folder/subfolder"
                  value={uploadPath}
                  onChange={(e) => setUploadPath(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Zone */}
        <FileUploadZone onFilesSelected={handleFilesSelected} disabled={!selectedBucket || isLoadingBuckets} />

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Queue ({uploadQueue.length})</CardTitle>
                <div className="space-x-2">
                  <Button onClick={startAllUploads} size="sm">
                    Upload All
                  </Button>
                  <Button onClick={clearCompleted} variant="outline" size="sm" className="bg-transparent">
                    Clear Completed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <UploadQueue uploads={uploadQueue} onStartUpload={startUpload} onRemoveUpload={removeUpload} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
