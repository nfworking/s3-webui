"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ConnectionStatus } from "./connection-status"
import { FolderIcon, CloudArrowUpIcon, Cog6ToothIcon, ServerIcon, HomeIcon } from "@heroicons/react/24/outline"

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Buckets", href: "/buckets", icon: ServerIcon },
  { name: "Files", href: "/files", icon: FolderIcon },
  { name: "Uploads", href: "/uploads", icon: CloudArrowUpIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo/Header */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <ServerIcon className="h-8 w-8 text-sidebar-primary" />
          <span className="text-xl font-bold text-sidebar-foreground">MinIO Client</span>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-sidebar-border">
        <ConnectionStatus />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground",
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="text-xs text-sidebar-foreground/60">MinIO S3 Storage Client</div>
      </div>
    </div>
  )
}
