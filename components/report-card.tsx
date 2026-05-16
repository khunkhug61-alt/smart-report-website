'use client'

import type { Report } from '@/lib/store'
import { useReportStore } from '@/lib/store'
import { StatusBadge } from './status-badge'
import { MapPin, Calendar, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

interface ReportCardProps {
  report: Report
  showActions?: boolean
  editToken?: string
  isAdmin?: boolean
  onEdit?: (report: Report) => void
}

export function ReportCard({ report, showActions = false, editToken, isAdmin = false, onEdit }: ReportCardProps) {
  const { deleteReport } = useReportStore()
  const [showImage, setShowImage] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canEdit = isAdmin || (editToken && report.editToken === editToken)
  const categoryName = report.category

  const handleDelete = () => {
    if (confirmDelete) {
      deleteReport(report.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {categoryName}
            </span>
            <StatusBadge status={report.status} size="sm" />
          </div>

          <p className="text-foreground leading-relaxed">{report.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {report.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(report.createdAt)}
            </span>
          </div>
        </div>

        {report.imageUrl && (
          <div className="relative">
            <button
              onClick={() => setShowImage(!showImage)}
              className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-muted/50 transition-colors hover:bg-muted"
              aria-label="ดูรูปภาพ"
            >
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {report.imageUrl && showImage && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <img
            src={report.imageUrl}
            alt="รูปภาพประกอบ"
            className="max-h-64 w-full object-contain"
          />
        </div>
      )}

      {showActions && canEdit && (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          {onEdit && (
            <button
              onClick={() => onEdit(report)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
              แก้ไข
            </button>
          )}
          <button
            onClick={handleDelete}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              confirmDelete
                ? 'bg-destructive text-destructive-foreground'
                : 'text-destructive hover:bg-destructive/10'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            {confirmDelete ? 'คลิกอีกครั้งเพื่อยืนยัน' : 'ลบ'}
          </button>
        </div>
      )}
    </div>
  )
}
