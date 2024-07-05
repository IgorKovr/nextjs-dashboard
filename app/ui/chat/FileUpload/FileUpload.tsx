import { PaperClipIcon } from '@heroicons/react/24/outline'
import { ChangeEvent } from 'react'
import { cn } from '@/app/lib/utils'

const ALLOWED_FILE_TYPES = ['.md', '.txt', '.pdf']

type Props = {
  id: string
  onChange?: (event?: ChangeEvent<HTMLInputElement>) => void
  label?: string
  allowedTypes?: string[]
  disabled?: boolean
  className?: string
}

const FileUpload = ({id, onChange, label, allowedTypes, disabled, className}: Props) => {
  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        <label
          htmlFor={id}
          className={cn('cursor-pointer', disabled && 'cursor-not-allowed text-neutral-500')}>
          <PaperClipIcon className="h-8 w-8" />
        </label>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'line-clamp-1 cursor-pointer',
              disabled && 'cursor-not-allowed text-neutral-500'
            )}>
            {label}
          </label>
        )}
      </div>
      <input
        type="file"
        id={id}
        accept={(allowedTypes || ALLOWED_FILE_TYPES).join(',')}
        className="sr-only"
        disabled={disabled}
        onChange={onChange}
      />
    </>
  )
}

export default FileUpload
