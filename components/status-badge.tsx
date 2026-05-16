import type { ReportStatus } from '@/lib/store'
import { Clock, Loader2, CheckCircle2 } from 'lucide-react'

interface StatusBadgeProps {
  status: ReportStatus
  size?: 'sm' | 'md'
}

const statusConfig = {
  pending: {
    label: 'รอดำเนินการ',
    className: 'status-pending',
    icon: Clock,
  },
  'in-progress': {
    label: 'กำลังแก้ไข',
    className: 'status-progress',
    icon: Loader2,
  },
  done: {
    label: 'เสร็จแล้ว',
    className: 'status-done',
    icon: CheckCircle2,
  },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.className} ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${status === 'in-progress' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  )
}
