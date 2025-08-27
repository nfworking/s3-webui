"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EllipsisVerticalIcon, ArrowDownTrayIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline"
import { downloadFile, deleteObject, copyObject } from "@/lib/minio-client"
import type { MinIOObject } from "@/types/minio"

interface FileActionsProps {
  file: MinIOObject
  bucketName: string
  onRefresh: () => void
  className?: string
}

export function FileActions({ file, bucketName, onRefresh, className }: FileActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newName, setNewName] = useState("")

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const blob = await downloadFile(bucketName, file.name)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.name.split("/").pop() || file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return

    setIsLoading(true)
    try {
      await deleteObject(bucketName, file.name)
      onRefresh()
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Delete failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRename = async () => {
    if (!newName.trim()) return

    setIsLoading(true)
    try {
      const pathParts = file.name.split("/")
      pathParts[pathParts.length - 1] = newName.trim()
      const newObjectName = pathParts.join("/")

      await copyObject(bucketName, file.name, bucketName, newObjectName)
      await deleteObject(bucketName, file.name)

      setIsRenameOpen(false)
      setNewName("")
      onRefresh()
    } catch (error) {
      console.error("Rename failed:", error)
      alert("Rename failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const openRenameDialog = () => {
    setNewName(file.name.split("/").pop() || file.name)
    setIsRenameOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${className}`} disabled={isLoading}>
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDownload}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openRenameDialog}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newName">New name</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new file name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRenameOpen(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleRename} disabled={!newName.trim() || isLoading}>
                {isLoading ? "Renaming..." : "Rename"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
