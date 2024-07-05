import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/app/lib/utils'

type Props = {
  name: string
  onRemove: () => void
  className?: string
}
const FileItem = ({name, className, onRemove}: Props) => {
  return (
    <div className={cn('flex items-center', className)}>
      <label>{name}</label> 
      <XMarkIcon className="h-4 w-4" onClick={onRemove} />
    </div>
  )
}

export default FileItem
