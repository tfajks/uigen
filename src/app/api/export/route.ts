import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/lib/exportService'

const exportService = new ExportService()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; format?: string; componentName?: string }

    if (!body.code) {
      return NextResponse.json({ error: 'Missing required field: code' }, { status: 400 })
    }

    if (!body.format) {
      return NextResponse.json({ error: 'Missing required field: format' }, { status: 400 })
    }

    const result = await exportService.exportComponent(body.code, {
      format: body.format as never,
      componentName: body.componentName,
      addHeader: true,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status = message.startsWith('Unsupported format') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function GET() {
  return NextResponse.json({
    formats: exportService.getSupportedFormats(),
    endpoint: 'POST /api/export',
  })
}
