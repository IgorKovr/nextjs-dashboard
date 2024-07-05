import { Revenue } from './definitions'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { Children, ReactNode } from 'react'

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
  const formatter = new Intl.DateTimeFormat(locale, options)
  return formatter.format(date)
}

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = []
  const highestRecord = Math.max(...revenue.map((month) => month.revenue))
  const topLabel = Math.ceil(highestRecord / 1000) * 1000

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`)
  }

  return { yAxisLabels, topLabel }
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages]
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages]
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ]
}

// TODO: Rename
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TODO: Unify date formatter
export function formatDate(date: Date) {
  return format(new Date(date), ' - dd/MM/yy HH:mm')
}

// TODO: Remove if we don't plan to parse code
export function parseMimeType(mimeType: string) {
  switch (mimeType) {
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    case 'py':
      return 'python'
    case 'txt':
      return 'text'
    case 'md':
      return 'markdown'
    case 'jsx':
    case 'tsx':
      return 'reactjs'
    default:
      return mimeType
  }
}

export type CodeBlockChild = {
  props: {
    children: ReactNode[]
  }
}

export const extractTextFromCodeBlock = (child: CodeBlockChild): string => {
  if (typeof child === 'string') {
    return child
  } else if (child?.props?.children) {
    return Children.toArray(child.props.children)
      .map((nestedChild: any) => extractTextFromCodeBlock(nestedChild))
      .join('')
  } else {
    return ''
  }
}
