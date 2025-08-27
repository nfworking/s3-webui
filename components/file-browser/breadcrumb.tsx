"use client"

import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"

interface BreadcrumbProps {
  bucketName: string
  currentPath: string
  onPathClick: (path: string) => void
}

export function Breadcrumb({ bucketName, currentPath, onPathClick }: BreadcrumbProps) {
  const pathParts = currentPath.split("/").filter(Boolean)

  return (
    <nav className="flex items-center space-x-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPathClick("")}
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        {bucketName}
      </Button>

      {pathParts.map((part, index) => {
        const path = pathParts.slice(0, index + 1).join("/") + "/"
        const isLast = index === pathParts.length - 1

        return (
          <div key={path} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPathClick(path)}
              className={`h-8 px-2 ${
                isLast ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {part}
            </Button>
          </div>
        )
      })}
    </nav>
  )
}
