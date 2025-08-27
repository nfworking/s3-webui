"use client"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast, type Toast } from "@/hooks/use-toast"
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

interface ToastComponentProps {
  toast: Toast
  onDismiss: () => void
}

function ToastComponent({ toast, onDismiss }: ToastComponentProps) {
  const getIcon = () => {
    switch (toast.variant) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case "destructive":
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getVariantStyles = () => {
    switch (toast.variant) {
      case "success":
        return "border-green-200 bg-green-50"
      case "destructive":
        return "border-red-200 bg-red-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div
      className={cn(
        "relative flex w-full items-start space-x-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-top-2",
        getVariantStyles(),
      )}
    >
      {getIcon()}
      <div className="flex-1 space-y-1">
        {toast.title && <div className="text-sm font-medium">{toast.title}</div>}
        {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
