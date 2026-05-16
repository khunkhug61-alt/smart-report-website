'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReportStatus = 'pending' | 'in-progress' | 'done'

export interface Report {
  id: string
  category: string
  description: string
  location: string
  imageUrl?: string
  status: ReportStatus
  createdAt: string
  updatedAt: string
  editToken: string // Token for anonymous editing/deleting
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Admin {
  username: string
  password: string
}

export interface TelegramSettings {
  botToken: string
  chatId: string
  enabled: boolean
}

interface ReportStore {
  reports: Report[]
  categories: Category[]
  admin: Admin
  isAdminLoggedIn: boolean
  telegram: TelegramSettings
  
  // Report actions
  addReport: (report: Omit<Report, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'editToken'>) => Promise<string>
  updateReport: (id: string, updates: Partial<Report>) => void
  deleteReport: (id: string) => void
  getReportById: (id: string) => Report | undefined
  getReportByEditToken: (editToken: string) => Report | undefined
  updateReportStatus: (id: string, status: ReportStatus) => void
  
  // Fetch actions
  fetchReports: () => Promise<void>
  
  // Admin actions
  loginAdmin: (username: string, password: string) => boolean
  logoutAdmin: () => void
  
  // Telegram actions
  updateTelegramSettings: (settings: Partial<TelegramSettings>) => void
  sendTelegramNotify: (message: string, imageData?: string) => Promise<boolean>
}

const defaultCategories: Category[] = [
  { id: '1', name: 'ไฟฟ้า', icon: 'Lightbulb' },
  { id: '2', name: 'แอร์/เครื่องปรับอากาศ', icon: 'Wind' },
  { id: '3', name: 'ประปา/ห้องน้ำ', icon: 'Droplets' },
  { id: '4', name: 'อุปกรณ์ชำรุด', icon: 'Wrench' },
  { id: '5', name: 'ความสะอาด', icon: 'Sparkles' },
  { id: '6', name: 'อินเทอร์เน็ต/คอมพิวเตอร์', icon: 'Wifi' },
  { id: '7', name: 'อื่นๆ', icon: 'MoreHorizontal' },
]

const generateId = () => Math.random().toString(36).substring(2, 15)
const generateEditToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],
      categories: defaultCategories,
      admin: { username: 'admin', password: 'admin123' },
      isAdminLoggedIn: false,
      telegram: { botToken: '', chatId: '', enabled: false },

      // helper: normalize DB row (snake_case) -> client Report shape (camelCase)
      addReport: async (reportData) => {
        try {
          const res = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: reportData.category,
              description: reportData.description,
              location: reportData.location,
              image_url: reportData.imageUrl,
            }),
          })
          const data = await res.json()
          if (data?.success && data.data) {
            const row = data.data
            const cat = (state => state.categories)(get())
            const categoryName = (cat || []).find(c => String(c.id) === String(row.category_id))?.name || String(row.category_id)
            const mapped = {
              id: row.id,
              category: categoryName,
              description: row.description,
              location: row.location,
              imageUrl: row.image_url ?? undefined,
              status: row.status,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              editToken: row.edit_token,
            }
            set((state) => ({ reports: [mapped, ...state.reports] }))
            return mapped.editToken
          }
        } catch (e) {
          console.error('addReport failed', e)
        }
        return ''
      },

      updateReport: (id, updates) => {
        ;(async () => {
          try {
            const res = await fetch('/api/reports', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, updates }),
            })
            const data = await res.json()
            if (data?.success && data.data) {
              const row = data.data
              const categoryName = (get().categories || []).find(c => String(c.id) === String(row.category_id))?.name || String(row.category_id)
              const mapped = {
                id: row.id,
                category: categoryName,
                description: row.description,
                location: row.location,
                imageUrl: row.image_url ?? undefined,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                editToken: row.edit_token,
              }
              set((state) => ({
                reports: state.reports.map((report) =>
                  report.id === id ? { ...report, ...mapped } : report
                ),
              }))
            }
          } catch (e) {
            console.error('updateReport failed', e)
          }
        })()
      },

      deleteReport: (id) => {
        ;(async () => {
          try {
            await fetch(`/api/reports?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
            set((state) => ({ reports: state.reports.filter((report) => report.id !== id) }))
          } catch (e) {
            console.error('deleteReport failed', e)
          }
        })()
      },

      getReportById: (id) => {
        // attempt local first, then fetch server-side
        const local = get().reports.find((report) => report.id === id)
        if (local) return local
        ;(async () => {
          try {
            const res = await fetch(`/api/reports?id=${encodeURIComponent(id)}`)
            const data = await res.json()
            if (data?.success && data.data) {
              const row = data.data
              const categoryName = (get().categories || []).find(c => String(c.id) === String(row.category_id))?.name || String(row.category_id)
              const mapped = {
                id: row.id,
                category: categoryName,
                description: row.description,
                location: row.location,
                imageUrl: row.image_url ?? undefined,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                editToken: row.edit_token,
              }
              set((state) => ({ reports: [mapped, ...state.reports] }))
            }
          } catch (e) {
            console.error('getReportById failed', e)
          }
        })()
        return undefined
      },

      getReportByEditToken: (editToken) => {
        const local = get().reports.find((report) => report.editToken === editToken)
        if (local) return local
        ;(async () => {
          try {
            const res = await fetch(`/api/reports?editToken=${encodeURIComponent(editToken)}`)
            const data = await res.json()
            if (data?.success && data.data) {
              const row = data.data
              const categoryName = (get().categories || []).find(c => String(c.id) === String(row.category_id))?.name || String(row.category_id)
              const mapped = {
                id: row.id,
                category: categoryName,
                description: row.description,
                location: row.location,
                imageUrl: row.image_url ?? undefined,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                editToken: row.edit_token,
              }
              set((state) => ({ reports: [mapped, ...state.reports] }))
            }
          } catch (e) {
            console.error('getReportByEditToken failed', e)
          }
        })()
        return undefined
      },

      updateReportStatus: (id, status) => {
        ;(async () => {
          try {
            const res = await fetch('/api/reports', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, updates: { status } }),
            })
            const data = await res.json()
            if (data?.success && data.data) {
              const row = data.data
              const categoryName = (get().categories || []).find(c => String(c.id) === String(row.category_id))?.name || String(row.category_id)
              const mapped = {
                id: row.id,
                category: categoryName,
                description: row.description,
                location: row.location,
                imageUrl: row.image_url ?? undefined,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                editToken: row.edit_token,
              }
              set((state) => ({
                reports: state.reports.map((report) =>
                  report.id === id ? { ...report, ...mapped } : report
                ),
              }))
            }
          } catch (e) {
            console.error('updateReportStatus failed', e)
          }
        })()
      },

      fetchReports: async () => {
        try {
          const res = await fetch('/api/reports')
          const data = await res.json()
          if (data?.success && Array.isArray(data.data)) {
            const categories = get().categories || []
            const mapped = data.data.map((row: any) => ({
              id: row.id,
              category: categories.find(c => String(c.id) === String(row.category_id))?.name || String(row.category_id),
              description: row.description,
              location: row.location,
              imageUrl: row.image_url ?? undefined,
              status: row.status,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              editToken: row.edit_token,
            }))
            set({ reports: mapped })
          }
        } catch (e) {
          console.error('fetchReports failed', e)
        }
      },

      loginAdmin: (username, password) => {
        const { admin } = get()
        if (username === admin.username && password === admin.password) {
          set({ isAdminLoggedIn: true })
          return true
        }
        return false
      },

      logoutAdmin: () => {
        set({ isAdminLoggedIn: false })
      },

      updateTelegramSettings: (settings) => {
        set((state) => ({
          telegram: { ...state.telegram, ...settings },
        }))
      },

      sendTelegramNotify: async (message, imageData) => {
        const { telegram } = get()
        if (!telegram.enabled || !telegram.botToken || !telegram.chatId) {
          return false
        }

        try {
          const payload: any = { message, botToken: telegram.botToken, chatId: telegram.chatId }
          if (imageData) payload.image = imageData
          const response = await fetch('/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const data = await response.json()
          return data.success
        } catch (error) {
          console.error('Failed to send Telegram notification:', error)
          return false
        }
      },
    }),
    {
      name: 'smart-report-storage',
    }
  )
)

// Fetch categories from server on client initialization
;(async () => {
  try {
    if (typeof window === 'undefined') return
    const res = await fetch('/api/categories')
    const data = await res.json()
    if (data?.success && Array.isArray(data.data)) {
      // update the persisted store categories
      const raw = localStorage.getItem('smart-report-storage')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          parsed.state = parsed.state || {}
          parsed.state.categories = data.data
          localStorage.setItem('smart-report-storage', JSON.stringify(parsed))
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {
    // ignore
  }
})()
