export type ComponentFormat = 'tsx' | 'jsx' | 'vue' | 'svelte'

export interface ExportOptions {
  format: ComponentFormat
  componentName?: string
  addHeader?: boolean
}

export interface ExportResult {
  filename: string
  content: string
  format: ComponentFormat
  sizeBytes: number
}
