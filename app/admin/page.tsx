'use client'

import { useState, useEffect } from 'react'
import { useReportStore, type Report, type ReportStatus } from '@/lib/store'
import { StatusBadge } from '@/components/status-badge'
import {
  Shield,
  Lock,
  LogOut,
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  Loader2,
  Search,
  Filter,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Bell,
  Settings,
  Send,
  ExternalLink,
} from 'lucide-react'

type FilterStatus = 'all' | ReportStatus

export default function AdminPage() {
  const {
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    reports,
    updateReportStatus,
    updateReport,
    deleteReport,
    telegram,
    updateTelegramSettings,
    sendTelegramNotify,
    fetchReports,
  } = useReportStore()

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [editForm, setEditForm] = useState({ description: '', location: '', status: 'pending' as ReportStatus })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [showTelegramSettings, setShowTelegramSettings] = useState(false)
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  // Fetch reports from server on mount
  useEffect(() => {
    fetchReports()
  }, [])

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    done: reports.filter(r => r.status === 'done').length,
  }

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const success = loginAdmin(loginForm.username, loginForm.password)
    if (!success) {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } else {
      setLoginError('')
    }
  }

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    const report = reports.find(r => r.id === reportId)
    updateReportStatus(reportId, newStatus)
    
    if (report) {
      const statusText = {
        'pending': 'รอดำเนินการ',
        'in-progress': 'กำลังแก้ไข',
        'done': 'เสร็จแล้ว'
      }
      const message = `📋 <b>อัปเดตสถานะ</b>

📂 หมวดหมู่: ${report.category}
📍 สถานที่: ${report.location}
🔄 สถานะใหม่: ${statusText[newStatus]}
🕐 เวลา: ${new Date().toLocaleString('th-TH')}`
      sendTelegramNotify(message)
    }
  }

  const handleEditReport = (report: Report) => {
    setEditingReport(report)
    setEditForm({
      description: report.description,
      location: report.location,
      status: report.status,
    })
  }

  const saveEdit = () => {
    if (editingReport) {
      updateReport(editingReport.id, {
        description: editForm.description,
        location: editForm.location,
        status: editForm.status,
      })
      setEditingReport(null)
    }
  }

  const handleDelete = (reportId: string) => {
    if (confirmDelete === reportId) {
      deleteReport(reportId)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(reportId)
      setTimeout(() => setConfirmDelete(null), 3000)
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

  const testTelegramNotify = async () => {
    setTelegramTestStatus('sending')
    const success = await sendTelegramNotify('🔔 <b>ทดสอบการแจ้งเตือน</b>\n\nระบบ Smart Report เชื่อมต่อ Telegram สำเร็จ!')
    setTelegramTestStatus(success ? 'success' : 'error')
    setTimeout(() => setTelegramTestStatus('idle'), 3000)
  }

  // Login Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">เข้าสู่ระบบแอดมิน</h1>
            <p className="mt-2 text-muted-foreground">
              สำหรับเจ้าหน้าที่ดูแลระบบเท่านั้น
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-foreground">
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                type="text"
                value={loginForm.username}
                onChange={(e) => {
                  setLoginForm(prev => ({ ...prev, username: e.target.value }))
                  setLoginError('')
                }}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm(prev => ({ ...prev, password: e.target.value }))
                    setLoginError('')
                  }}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="กรอกรหัสผ่าน"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Lock className="mr-2 inline-block h-5 w-5" />
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">ข้อมูลสำหรับทดสอบ:</p>
            <p>ชื่อผู้ใช้: admin</p>
            <p>รหัสผ่าน: admin123</p>
          </div>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดแอดมิน</h1>
          </div>
          <p className="text-muted-foreground">จัดการรายการแจ้งปัญหาทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTelegramSettings(!showTelegramSettings)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors border-border text-foreground hover:bg-accent`}
          >
            <Bell className="h-5 w-5" />
            Telegram
          </button>
          <button
            onClick={logoutAdmin}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LogOut className="h-5 w-5" />
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Telegram Settings Panel */}
      {showTelegramSettings && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-foreground">ตั้งค่า Telegram Bot</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <div className="flex items-center gap-2 mb-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                ตั้งค่าผ่านระบบ Environment Variables แล้ว
              </div>
              <p>ระบบแจ้งเตือนผ่าน Telegram ถูกย้ายไปตั้งค่าในไฟล์ <code>.env.local</code> ของเซิร์ฟเวอร์ เพื่อความปลอดภัยและการใช้งานถาวรแล้วครับ ไม่จำเป็นต้องกรอกข้อมูลตรงนี้อีก</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={testTelegramNotify}
                disabled={telegramTestStatus === 'sending'}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors ${
                  telegramTestStatus === 'success'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : telegramTestStatus === 'error'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <Send className="h-4 w-4" />
                {telegramTestStatus === 'sending'
                  ? 'กำลังส่ง...'
                  : telegramTestStatus === 'success'
                  ? 'ส่งสำเร็จ!'
                  : telegramTestStatus === 'error'
                  ? 'ส่งไม่สำเร็จ'
                  : 'ทดสอบส่งข้อความ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">ทั้งหมด</span>
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">รอดำเนินการ</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">กำลังแก้ไข</span>
            <Loader2 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">เสร็จแล้ว</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.done}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาตามรายละเอียด, สถานที่, หมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            รอดำเนินการ
          </button>
          <button
            onClick={() => setFilterStatus('in-progress')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'in-progress'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            กำลังแก้ไข
          </button>
          <button
            onClick={() => setFilterStatus('done')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'done'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            เสร็จแล้ว
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">แก้ไขรายการ</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">สถานที่</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">รายละเอียด</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">สถานะ</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as ReportStatus }))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="in-progress">กำลังแก้ไข</option>
                  <option value="done">เสร็จแล้ว</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveEdit}
                  className="flex-1 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setEditingReport(null)}
                  className="flex-1 rounded-lg border border-border py-3 font-medium text-foreground transition-colors hover:bg-accent"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="รูปภาพประกอบ"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}

      {/* Reports Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">หมวดหมู่</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">รายละเอียด</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">สถานที่</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">วันที่</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">สถานะ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4">
                      <span className="rounded bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                        {report.category}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <p className="line-clamp-2 text-sm text-foreground">{report.description}</p>
                      {report.imageUrl && (
                        <button
                          onClick={() => setExpandedImage(report.imageUrl!)}
                          className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ImageIcon className="h-3 w-3" />
                          ดูรูปภาพ
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {report.location}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(report.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="pending">รอดำเนินการ</option>
                        <option value="in-progress">กำลังแก้ไข</option>
                        <option value="done">เสร็จแล้ว</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditReport(report)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label="แก้ไข"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className={`rounded-lg p-2 transition-colors ${
                            confirmDelete === report.id
                              ? 'bg-destructive text-destructive-foreground'
                              : 'text-destructive hover:bg-destructive/10'
                          }`}
                          aria-label="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
