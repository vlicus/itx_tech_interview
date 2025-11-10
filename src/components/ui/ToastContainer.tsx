'use client'

/**
 * ToastContainer Component
 * Displays toast notifications from the UI store
 */

import { useUIStore } from '@/lib/store'
import { cn } from '@/utils'
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon
} from 'lucide-react'
import { Button } from '@heroui/react'

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts)
  const removeToast = useUIStore((state) => state.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = {
          success: CheckCircleIcon,
          error: XCircleIcon,
          warning: AlertTriangleIcon,
          info: InfoIcon,
        }[toast.type]

        const colorClasses = {
          success: 'bg-success-50 text-success-900 border-success-200',
          error: 'bg-danger-50 text-danger-900 border-danger-200',
          warning: 'bg-warning-50 text-warning-900 border-warning-200',
          info: 'bg-primary-50 text-primary-900 border-primary-200',
        }[toast.type]

        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg',
              'animate-in slide-in-from-right duration-300',
              colorClasses
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => removeToast(toast.id)}
              className="flex-shrink-0"
              aria-label="Close notification"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
