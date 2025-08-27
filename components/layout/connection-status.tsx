"use client"

import { useConnectionStatus } from "@/hooks/use-connection-status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

export function ConnectionStatus() {
  const { status, error, lastChecked, isChecking, checkConnection } = useConnectionStatus()

  const getStatusDisplay = () => {
    switch (status) {
      case "connected":
        return {
          icon: <CheckCircleIcon className="h-3 w-3" />,
          text: "Connected",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        }
      case "connecting":
        return {
          icon: <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />,
          text: "Connecting",
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        }
      case "error":
        return {
          icon: <XCircleIcon className="h-3 w-3" />,
          text: "Error",
          variant: "destructive" as const,
          className: "",
        }
      default:
        return {
          icon: <ExclamationTriangleIcon className="h-3 w-3" />,
          text: "Disconnected",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  const getTooltipContent = () => {
    switch (status) {
      case "connected":
        return `Connected to MinIO server${lastChecked ? ` (Last checked: ${lastChecked.toLocaleTimeString()})` : ""}`
      case "connecting":
        return "Connecting to MinIO server..."
      case "error":
        return `Connection error: ${error}`
      default:
        return "Not connected to MinIO server"
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={statusDisplay.variant} className={`flex items-center space-x-1 ${statusDisplay.className}`}>
              {statusDisplay.icon}
              <span className="text-xs">{statusDisplay.text}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>

        {(status === "error" || status === "disconnected") && (
          <Button variant="ghost" size="sm" onClick={checkConnection} disabled={isChecking} className="h-6 w-6 p-0">
            <ArrowPathIcon className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}
