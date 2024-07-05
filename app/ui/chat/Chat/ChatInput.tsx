import { ChangeEvent, useRef } from 'react'
import { cn } from '@/app/lib/utils'
import { Button } from '../../button'
import { Textarea } from '../textarea'
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import FileUpload from '../FileUpload'

type Props = {
  onFileSelected?: (event?: ChangeEvent<HTMLInputElement>) => void
  file?: File | null
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void
  value: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  disabled?: boolean
  isUploading?: boolean
}

const ChatInput = ({
  file,
  onFileSelected,
  onChange,
  value,
  onSubmit,
  disabled,
  isUploading,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      {file && onFileSelected && (
        <FileUpload.File
          className="mb-2 flex flex-row items-center gap-2 px-2"
          name={file.name}
          onRemove={() => {
            onFileSelected()
          }}
        />
      )}
      <div className="flex flex-row items-center gap-10">
        <div className="flex flex-1 items-center gap-3">
          <Textarea
            className="flex max-h-[14rem] min-h-[2.5rem] flex-1"
            placeholder="Type your message"
            value={value}
            autoFocus
            rows={value.split(`\n`)?.length || 1}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()

                if (e.shiftKey)
                  onChange({ target: { value: `${value}\n` } } as any)
                else formRef.current?.requestSubmit()

                return
              }
            }}
          />
          {isUploading ? (
            <ArrowPathIcon className="h-5 w-5 text-neutral-500" />
          ) : (
            <FileUpload
              id="file"
              onChange={onFileSelected}
              disabled={isUploading}
            />
          )}
        </div>
        <Button
          className={cn('gap-2', disabled && 'bg-neutral-300')}
          type="submit"
          disabled={disabled || isUploading}
        >
          Send <PaperAirplaneIcon className="h-3 w-3" />
        </Button>
      </div>
    </form>
  )
}

export default ChatInput
