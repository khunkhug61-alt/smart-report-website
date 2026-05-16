const baseUrl = process.argv[2] || 'http://localhost:3000'

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`
  const res = await fetch(url, options)
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    data = text
  }
  return { status: res.status, ok: res.ok, data }
}

async function main() {
  console.log('Testing DB API on', baseUrl)

  console.log('\n1) Initialize DB (GET /api/db)')
  const initResult = await request('/api/db')
  console.log(initResult)

  console.log('\n2) Get reports (GET /api/reports)')
  const reportsBefore = await request('/api/reports')
  console.log(reportsBefore)

  console.log('\n3) Create sample report (POST /api/reports)')
  const createResult = await request('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category_id: 1,
      description: 'ทดสอบระบบฐานข้อมูล Neon และ API',
      location: 'อาคารตัวอย่าง',
      image_url: null,
    }),
  })
  console.log(createResult)

  if (createResult.ok && createResult.data?.success) {
    const id = createResult.data.data?.id
    console.log('\n4) Fetch created report by id')
    const fetchOne = await request(`/api/reports?id=${encodeURIComponent(id)}`)
    console.log(fetchOne)
  }
}

main().catch((err) => {
  console.error('Test script failed:', err)
  process.exit(1)
})
