import { NextRequest, NextResponse } from 'next/server'
import { PromptValidator } from '@/lib/promptValidator'

const validator = new PromptValidator()

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || !('prompt' in body)) {
    return NextResponse.json({ error: 'Missing required field: prompt' }, { status: 400 })
  }

  const { prompt } = body as { prompt: unknown }

  if (typeof prompt !== 'string') {
    return NextResponse.json(
      { error: 'Field "prompt" must be a string' },
      { status: 400 }
    )
  }

  const result = validator.sanitizeAndValidate(prompt)
  return NextResponse.json(result, { status: result.valid ? 200 : 422 })
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/validate',
    description: 'Validates and sanitizes a prompt string before sending to AI',
    fields: { prompt: 'string (required)' },
    limits: { maxChars: 2000 },
  })
}
