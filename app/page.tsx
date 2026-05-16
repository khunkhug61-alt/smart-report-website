'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useReportStore } from '@/lib/store'
import { StatusBadge } from '@/components/status-badge'
import { 
  ClipboardList, 
  FileText, 
  Search, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Lightbulb,
  Wind,
  Droplets,
  Wrench,
  Sparkles,
  Wifi,
  MoreHorizontal
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  Lightbulb,
  Wind,
  Droplets,
  Wrench,
  Sparkles,
  Wifi,
  MoreHorizontal,
}

export default function HomePage() {
  const { reports, categories, fetchReports } = useReportStore()

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

  const recentReports = reports.slice(0, 5)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-8 text-primary-foreground md:p-12">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <ClipboardList className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Smart Report System</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-balance md:text-4xl">
            ระบบแจ้งปัญหาภายในวิทยาลัย
          </h1>
          <p className="mb-6 text-lg opacity-90 text-pretty">
            วิทยาลัยอาชีวศึกษาภักดีพณิชยการและเทคโนโลยี - 
            แจ้งปัญหาได้ง่าย ติดตามสถานะได้สะดวก
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/report"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary shadow-lg transition-transform hover:scale-105"
            >
              <FileText className="h-5 w-5" />
              แจ้งปัญหา
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <Search className="h-5 w-5" />
              ติดตามสถานะ
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
      </section>

      {/* Stats Section */}
      <section>
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">สถิติการแจ้งปัญหา</h2>
        </div>
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
      </section>

      {/* Categories Section */}
      <section>
        <div className="mb-6 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">หมวดหมู่ปัญหา</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || MoreHorizontal
            const count = reports.filter(r => r.category === category.name).length
            return (
              <Link
                key={category.id}
                href={`/report?category=${encodeURIComponent(category.name)}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{count} รายการ</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">รายการล่าสุด</h2>
            </div>
            <Link
              href="/track"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {report.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {report.location}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-sm text-foreground">{report.description}</p>
                </div>
                <StatusBadge status={report.status} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="rounded-2xl border border-border bg-card p-8">
        <h2 className="mb-8 text-center text-xl font-bold text-foreground">วิธีการใช้งาน</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              1
            </div>
            <h3 className="mb-2 font-semibold text-foreground">แจ้งปัญหา</h3>
            <p className="text-sm text-muted-foreground">
              กรอกข้อมูลปัญหาที่พบ เลือกหมวดหมู่ ระบุสถานที่ และแนบรูปภาพ
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              2
            </div>
            <h3 className="mb-2 font-semibold text-foreground">รับรหัสติดตาม</h3>
            <p className="text-sm text-muted-foreground">
              หลังแจ้งปัญหาจะได้รับรหัสสำหรับติดตามสถานะและแก้ไขข้อมูล
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              3
            </div>
            <h3 className="mb-2 font-semibold text-foreground">ติดตามสถานะ</h3>
            <p className="text-sm text-muted-foreground">
              ใช้รหัสเพื่อติดตามสถานะการแก้ไข ตั้งแต่รอดำเนินการจนถึงเสร็จสิ้น
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
