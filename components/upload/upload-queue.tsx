"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileIcon } from "@/components/file-browser/file-icon"
import { PlayIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline"

interface UploadItem {
  id: string
  file: File
  bucketName: string
  objectName: string
  status: "pending" | "uploading" | "completed" | "error"
  progress: { loaded: number; total: number; percentage: number }
  error?: string
}

interface UploadQueueProps {
  uploads: UploadItem[]
  onStartUpload: (upload: UploadItem) => void
  onRemoveUpload: (id: string) => void
}

export function UploadQueue({ uploads, onStartUpload, onRemoveUpload }: UploadQueueProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case "error":
        return <ExclamationCircleIcon className="h-4 w-4 text-red-600" />
      case "uploading":
        return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "uploading":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Uploading</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-3">
      {uploads.map((upload) => (
        <div key={upload.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileIcon fileName={upload.file.name} className="h-5 w-5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={upload.file.name}>
                  {upload.file.name}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(upload.file.size)}</span>
                  <span>→</span>
                  <span className="truncate">
                    {upload.bucketName}/{upload.objectName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(upload.status)}
              {getStatusBadge(upload.status)}
              {upload.status === "pending" && (
                <Button size="sm" onClick={() => onStartUpload(upload)}>
                  <PlayIcon className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveUpload(upload.id)}
                disabled={upload.status === "uploading"}
              >
                <XMarkIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {upload.status === "uploading" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{upload.progress.percentage}%</span>
              </div>
              <Progress value={upload.progress.percentage} className="h-2" />
            </div>
          )}

          {upload.status === "error" && upload.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{upload.error}</div>
          )}
        </div>
      ))}
    </div>
  )
}
