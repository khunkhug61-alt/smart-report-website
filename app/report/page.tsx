'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useReportStore } from '@/lib/store'
import {
  FileText,
  MapPin,
  Upload,
  X,
  CheckCircle2,
  Copy,
  Lightbulb,
  Wind,
  Droplets,
  Wrench,
  Sparkles,
  Wifi,
  MoreHorizontal,
  AlertCircle,
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

function ReportForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { categories, addReport, sendTelegramNotify } = useReportStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    category: searchParams.get('category') || '',
    description: '',
    location: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; editToken?: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const compressImage = async (file: File) => {
    const reader = new FileReader()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const image = new Image()
    const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = dataUrl
    })

    const maxDimension = 1024
    let { width, height } = loadedImage
    if (width > maxDimension || height > maxDimension) {
      const ratio = width / height
      if (ratio > 1) {
        width = maxDimension
        height = Math.round(maxDimension / ratio)
      } else {
        height = maxDimension
        width = Math.round(maxDimension * ratio)
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Cannot get canvas context')
    ctx.drawImage(loadedImage, 0, 0, width, height)

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const quality = outputType === 'image/jpeg' ? 0.75 : undefined
    return canvas.toDataURL(outputType as any, quality as any)
  }

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setFormData(prev => ({ ...prev, category: categoryFromUrl }))
    }
  }, [searchParams])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const processImage = async () => {
        try {
          const compressedUrl = await compressImage(file)
          const base64 = compressedUrl.split(',')[1] || ''
          const byteLength = Math.ceil((base64.length * 3) / 4)
          if (byteLength > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'ขนาดไฟล์หลังบีบอัดต้องไม่เกิน 5MB' }))
            return
          }
          setImagePreview(compressedUrl)
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.image
            return newErrors
          })
        } catch (error) {
          console.error('Image compression failed', error)
          setErrors(prev => ({ ...prev, image: 'ไม่สามารถประมวลผลรูปภาพได้' }))
        }
      }
      processImage()
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.category) newErrors.category = 'กรุณาเลือกหมวดหมู่'
    if (!formData.description.trim()) newErrors.description = 'กรุณากรอกรายละเอียดปัญหา'
    if (!formData.location.trim()) newErrors.location = 'กรุณาระบุสถานที่'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const editToken = await addReport({
      category: formData.category,
      description: formData.description.trim(),
      location: formData.location.trim(),
      imageUrl: imagePreview || undefined,
    })

    // Send Telegram notification (include image if present)
    const telegramMessage = `🔔 <b>แจ้งปัญหาใหม่!</b>

📂 หมวดหมู่: ${formData.category}
📍 สถานที่: ${formData.location.trim()}
📝 รายละเอียด: ${formData.description.trim()}
🕐 เวลา: ${new Date().toLocaleString('th-TH')}`
    sendTelegramNotify(telegramMessage, imagePreview || undefined)

    setSubmitResult({ success: true, editToken })
    setIsSubmitting(false)
  }

  const copyEditToken = () => {
    if (submitResult?.editToken) {
      navigator.clipboard.writeText(submitResult.editToken)
    }
  }

  const resetForm = () => {
    setFormData({ category: '', description: '', location: '' })
    setImagePreview(null)
    setSubmitResult(null)
    setErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (submitResult?.success) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">แจ้งปัญหาสำเร็จ!</h2>
          <p className="mb-6 text-muted-foreground">
            ระบบได้รับข้อมูลของคุณแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบโดยเร็ว
          </p>

          <div className="mb-6 rounded-xl bg-muted p-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">รหัสสำหรับติดตามและแก้ไข</p>
            <div className="flex items-center justify-center gap-2">
              <code className="rounded bg-background px-3 py-2 font-mono text-lg text-foreground">
                {submitResult.editToken}
              </code>
              <button
                onClick={copyEditToken}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="คัดลอกรหัส"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              กรุณาบันทึกรหัสนี้ไว้เพื่อใช้ติดตามสถานะและแก้ไขข้อมูล
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FileText className="h-5 w-5" />
              แจ้งปัญหาใหม่
            </button>
            <button
              onClick={() => router.push('/track')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
            >
              ติดตามสถานะ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">แจ้งปัญหา</h1>
        </div>
        <p className="text-muted-foreground">
          กรอกข้อมูลปัญหาที่พบเพื่อให้เจ้าหน้าที่ดำเนินการแก้ไข
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground">
            หมวดหมู่ปัญหา <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || MoreHorizontal
              const isSelected = formData.category === category.name
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, category: category.name }))
                    setErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors.category
                      return newErrors
                    })
                  }}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-center text-xs font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
          {errors.category && (
            <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.category}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-medium text-foreground">
            สถานที่ <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="location"
              type="text"
              placeholder="เช่น อาคาร A ชั้น 2 ห้อง 201"
              value={formData.location}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, location: e.target.value }))
                setErrors(prev => {
                  const newErrors = { ...prev }
                  delete newErrors.location
                  return newErrors
                })
              }}
              className={`w-full rounded-lg border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.location ? 'border-destructive' : 'border-input'
              }`}
            />
          </div>
          {errors.location && (
            <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.location}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
            รายละเอียดปัญหา <span className="text-destructive">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="อธิบายรายละเอียดปัญหาที่พบ..."
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }))
              setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.description
                return newErrors
              })
            }}
            className={`w-full rounded-lg border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.description ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors.description && (
            <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            แนบรูปภาพ (ไม่บังคับ)
          </label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-lg transition-transform hover:scale-110"
                aria-label="ลบรูปภาพ"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-input bg-muted/50 p-8 transition-colors hover:border-primary hover:bg-muted"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium text-foreground">คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p className="text-sm text-muted-foreground">PNG, JPG ขนาดไม่เกิน 5MB</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {errors.image && (
            <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.image}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งปัญหา'}
        </button>
      </form>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ReportForm />
    </Suspense>
  )
}
