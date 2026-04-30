export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  charCount: number
  estimatedTokens: number
}

export interface ValidatorConfig {
  maxChars?: number
  warnAtPercent?: number
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|context)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /disregard\s+(all\s+)?(previous|prior)\s+/i,
]

const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g

export class PromptValidator {
  private readonly maxChars: number
  private readonly warnThreshold: number

  constructor({ maxChars = 2000, warnAtPercent = 85 }: ValidatorConfig = {}) {
    if (maxChars < 1) throw new Error('maxChars must be at least 1')
    if (warnAtPercent <= 0 || warnAtPercent >= 100)
      throw new Error('warnAtPercent must be between 0 and 100 (exclusive)')
    this.maxChars = maxChars
    this.warnThreshold = Math.floor((maxChars * warnAtPercent) / 100)
  }

  sanitize(input: string): string {
    return input.replace(CONTROL_CHAR_RE, '').trim()
  }

  validate(input: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const charCount = input.length
    const estimatedTokens = Math.ceil(charCount / 4)

    if (input.trim().length === 0) {
      errors.push('Prompt cannot be empty')
    }

    if (charCount > this.maxChars) {
      errors.push(
        `Prompt exceeds ${this.maxChars} character limit (${charCount} chars)`
      )
    } else if (charCount >= this.warnThreshold) {
      warnings.push(
        `Prompt is ${charCount}/${this.maxChars} characters — approaching the limit`
      )
    }

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        warnings.push(
          'Prompt contains patterns that may interfere with AI instructions'
        )
        break
      }
    }

    return { valid: errors.length === 0, errors, warnings, charCount, estimatedTokens }
  }

  /** Convenience: sanitize then validate in one step. */
  sanitizeAndValidate(raw: string): ValidationResult & { sanitized: string } {
    const sanitized = this.sanitize(raw)
    return { ...this.validate(sanitized), sanitized }
  }
}
