export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface PasswordPolicy {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireDigit?: boolean
  requireSpecial?: boolean
  maxLength?: number
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: false,
  maxLength: 128,
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!email || email.trim().length === 0) {
    errors.push('Email is required')
    return { valid: false, errors, warnings }
  }

  const trimmed = email.trim()

  if (trimmed.length > 254) {
    errors.push('Email must not exceed 254 characters')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    errors.push('Email format is invalid')
  }

  if (trimmed !== email) {
    warnings.push('Email contained leading or trailing whitespace')
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_POLICY
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const cfg = { ...DEFAULT_POLICY, ...policy }

  if (!password) {
    errors.push('Password is required')
    return { valid: false, errors, warnings }
  }

  if (cfg.minLength && password.length < cfg.minLength) {
    errors.push(`Password must be at least ${cfg.minLength} characters`)
  }

  if (cfg.maxLength && password.length > cfg.maxLength) {
    errors.push(`Password must not exceed ${cfg.maxLength} characters`)
  }

  if (cfg.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (cfg.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (cfg.requireDigit && !/\d/.test(password)) {
    errors.push('Password must contain at least one digit')
  }

  if (cfg.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  if (password.length >= 16) {
    warnings.push('Consider using a password manager for long passwords')
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!username || username.trim().length === 0) {
    errors.push('Username is required')
    return { valid: false, errors, warnings }
  }

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters')
  }

  if (username.length > 32) {
    errors.push('Username must not exceed 32 characters')
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username may only contain letters, numbers, underscores and hyphens')
  }

  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    errors.push('Username must not start or end with underscore or hyphen')
  }

  return { valid: errors.length === 0, errors, warnings }
}
