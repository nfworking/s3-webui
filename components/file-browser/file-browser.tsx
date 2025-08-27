"use client"

import { useState, useEffect } from "react"
import { listObjects } from "@/lib/minio-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileIcon } from "@/components/file-browser/file-icon"
import { Breadcrumb } from "@/components/file-browser/breadcrumb"
import { FileActions } from "@/components/file-browser/file-actions"
import { FolderIcon, ListBulletIcon, Squares2X2Icon, ArrowUpIcon } from "@heroicons/react/24/outline"
import type { MinIOObject } from "@/types/minio"

interface FileBrowserProps {
  bucketName: string
  searchQuery: string
}

type ViewMode = "grid" | "list"

export function FileBrowser({ bucketName, searchQuery }: FileBrowserProps) {
  const [objects, setObjects] = useState<MinIOObject[]>([])
  const [currentPath, setCurrentPath] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  useEffect(() => {
    loadObjects()
  }, [bucketName, currentPath])

  const loadObjects = async () => {
    setIsLoading(true)
    setError("")

    try {
      const objectList = await listObjects(bucketName, currentPath || undefined)
      setObjects(objectList)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load objects")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredObjects = objects.filter((obj) => obj.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const folders = filteredObjects.filter((obj) => obj.name.endsWith("/"))
  const files = filteredObjects.filter((obj) => !obj.name.endsWith("/"))

  const handleFolderClick = (folderName: string) => {
    setCurrentPath(folderName)
  }

  const handleBackClick = () => {
    const pathParts = currentPath.split("/").filter(Boolean)
    pathParts.pop()
    setCurrentPath(pathParts.length > 0 ? pathParts.join("/") + "/" : "")
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return ""
    const d = typeof date === "string" ? new Date(date) : date
    if (isNaN(d.getTime())) return ""
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Breadcrumb bucketName={bucketName} currentPath={currentPath} onPathClick={setCurrentPath} />
          {currentPath && (
            <Button onClick={handleBackClick} variant="outline" size="sm" className="bg-transparent">
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setViewMode("grid")}
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            className={viewMode !== "grid" ? "bg-transparent" : ""}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className={viewMode !== "list" ? "bg-transparent" : ""}
          >
            <ListBulletIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Browser Content */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading files...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Folders</h3>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    : "space-y-2"
                }
              >
                {folders.map((folder) => (
                  <Card
                    key={folder.name}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleFolderClick(folder.name)}
                  >
                    <CardContent
                      className={viewMode === "grid" ? "p-4 text-center" : "p-3 flex items-center space-x-3"}
                    >
                      <FolderIcon
                        className={viewMode === "grid" ? "h-8 w-8 text-primary mx-auto mb-2" : "h-5 w-5 text-primary"}
                      />
                      <div className={viewMode === "grid" ? "" : "flex-1 min-w-0"}>
                        <p className="text-sm font-medium truncate">
                          {folder.name.replace(/\/$/, "").split("/").pop()}
                        </p>
                        {viewMode === "list" && (
                          <p className="text-xs text-muted-foreground">{formatDate(folder.lastModified)}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Files</h3>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    : "space-y-2"
                }
              >
                {files.map((file) => (
                  <Card key={file.name} className="hover:shadow-md transition-shadow">
                    <CardContent
                      className={viewMode === "grid" ? "p-4 text-center" : "p-3 flex items-center space-x-3"}
                    >
                      <FileIcon
                        fileName={file.name}
                        className={viewMode === "grid" ? "h-8 w-8 mx-auto mb-2" : "h-5 w-5"}
                      />
                      <div className={viewMode === "grid" ? "" : "flex-1 min-w-0"}>
                        <p className="text-sm font-medium truncate" title={file.name}>
                          {file.name.split("/").pop()}
                        </p>
                        <div className={viewMode === "grid" ? "mt-2 space-y-1" : "flex items-center space-x-2 mt-1"}>
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(file.size)}
                          </Badge>
                          {viewMode === "list" && (
                            <span className="text-xs text-muted-foreground">{formatDate(file.lastModified)}</span>
                          )}
                        </div>
                        {viewMode === "grid" && (
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(file.lastModified)}</p>
                        )}
                      </div>
                      <FileActions
                        file={file}
                        bucketName={bucketName}
                        onRefresh={loadObjects}
                        className={viewMode === "grid" ? "mt-2" : ""}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {folders.length === 0 && files.length === 0 && !isLoading && (
            <Card>
              <CardContent className="pt-6 text-center">
                <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No files match your search." : "This folder is empty."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
