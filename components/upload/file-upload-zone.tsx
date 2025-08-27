"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline"

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export function FileUploadZone({ onFilesSelected, disabled }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onFilesSelected(files)
      }
    },
    [disabled, onFilesSelected],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFilesSelected(files)
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ""
    },
    [onFilesSelected],
  )

  return (
    <Card
      className={`transition-colors ${
        isDragOver ? "border-primary bg-primary/5" : "border-dashed border-2 border-muted-foreground/25"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <CloudArrowUpIcon className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Drop files here to upload</h3>
            <p className="text-muted-foreground mt-1">or click to browse files</p>
          </div>
          <div>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={disabled}>
                <span>
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  Choose Files
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports all file types. Maximum file size depends on your MinIO configuration.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
