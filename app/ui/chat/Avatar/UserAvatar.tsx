import { UserIcon } from '@heroicons/react/24/outline'

import Avatar from './Avatar'

const BotAvatar = () => {
  return (
    <Avatar>
      <UserIcon className="h-7 w-7 text-zinc-600 dark:text-zinc-200" />
    </Avatar>
  )
}

export default BotAvatar
