'use client'

import { useState, useEffect } from 'react'
import { useReportStore, type Report, type ReportStatus } from '@/lib/store'
import { ReportCard } from '@/components/report-card'
import { StatusBadge } from '@/components/status-badge'
import {
  Search,
  Filter,
  Key,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

type FilterStatus = 'all' | ReportStatus

export default function TrackPage() {
  const { reports, getReportByEditToken, updateReport, fetchReports } = useReportStore()
  const [searchToken, setSearchToken] = useState('')
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [myReport, setMyReport] = useState<Report | null>(null)
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [editForm, setEditForm] = useState({ description: '', location: '' })
  const [tokenError, setTokenError] = useState('')
  const [tokenSuccess, setTokenSuccess] = useState(false)

  // Fetch reports from server on mount
  useEffect(() => {
    fetchReports()
  }, [])

  const filteredReports = reports.filter((report) => {
    if (filterStatus === 'all') return true
    return report.status === filterStatus
  })

  const handleTokenSearch = () => {
    if (!searchToken.trim()) {
      setTokenError('กรุณากรอกรหัสติดตาม')
      return
    }

    const found = getReportByEditToken(searchToken.trim())
    if (found) {
      setMyReport(found)
      setActiveToken(searchToken.trim())
      setTokenError('')
      setTokenSuccess(true)
      setTimeout(() => setTokenSuccess(false), 2000)
    } else {
      setTokenError('ไม่พบรายการที่ตรงกับรหัสนี้')
      setMyReport(null)
      setActiveToken(null)
    }
  }

  const clearMyReport = () => {
    setMyReport(null)
    setActiveToken(null)
    setSearchToken('')
    setEditingReport(null)
  }

  const handleEditReport = (report: Report) => {
    setEditingReport(report)
    setEditForm({
      description: report.description,
      location: report.location,
    })
  }

  const saveEdit = () => {
    if (editingReport) {
      updateReport(editingReport.id, {
        description: editForm.description,
        location: editForm.location,
      })
      // Update local state
      const updatedReport = { ...editingReport, ...editForm }
      setMyReport(updatedReport)
      setEditingReport(null)
    }
  }

  // Update myReport when reports change
  useEffect(() => {
    if (activeToken) {
      const updated = getReportByEditToken(activeToken)
      if (updated) {
        setMyReport(updated)
      } else {
        setMyReport(null)
        setActiveToken(null)
      }
    }
  }, [reports, activeToken, getReportByEditToken])

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">ติดตามสถานะ</h1>
        </div>
        <p className="text-muted-foreground">
          ค้นหาและติดตามสถานะการแก้ไขปัญหาที่คุณแจ้งไว้
        </p>
      </div>

      {/* Token Search */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">ค้นหาด้วยรหัสติดตาม</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="กรอกรหัสที่ได้รับหลังแจ้งปัญหา"
              value={searchToken}
              onChange={(e) => {
                setSearchToken(e.target.value)
                setTokenError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleTokenSearch()}
              className="w-full rounded-lg border border-input bg-background py-3 pl-4 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleTokenSearch}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="h-5 w-5" />
            ค้นหา
          </button>
        </div>
        {tokenError && (
          <p className="mt-3 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {tokenError}
          </p>
        )}
        {tokenSuccess && (
          <p className="mt-3 flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            พบรายการของคุณแล้ว
          </p>
        )}
      </div>

      {/* My Report Section */}
      {myReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">รายการของคุณ</h2>
            <button
              onClick={clearMyReport}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              ล้าง
            </button>
          </div>

          {editingReport ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">แก้ไขข้อมูล</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    สถานที่
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    รายละเอียด
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={saveEdit}
                    className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setEditingReport(null)}
                    className="rounded-lg border border-border px-4 py-2 font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ReportCard
              report={myReport}
              showActions
              editToken={activeToken || undefined}
              onEdit={handleEditReport}
            />
          )}
        </div>
      )}

      {/* Filter Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-foreground">กรองตามสถานะ:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            ทั้งหมด ({reports.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            รอดำเนินการ ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('in-progress')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'in-progress'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            กำลังแก้ไข ({reports.filter(r => r.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setFilterStatus('done')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'done'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            เสร็จแล้ว ({reports.filter(r => r.status === 'done').length})
          </button>
        </div>
      </div>

      {/* All Reports */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          รายการทั้งหมด ({filteredReports.length} รายการ)
        </h2>
        {filteredReports.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center shadow-sm">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">ยังไม่มีรายการแจ้งปัญหา</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
