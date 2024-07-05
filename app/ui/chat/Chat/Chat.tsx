import { memo, useEffect, useRef } from 'react'
import Avatar from '../Avatar'
import Message from '../Message'
import { TMessage } from '../Message/Message'

type Props = {
  messages: TMessage[]
}
const Chat = ({ messages }: Props) => {
  const scrollableContentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (scrollableContentRef.current) {
      scrollableContentRef.current.scrollTop =
        scrollableContentRef.current.scrollHeight
    }
  }, [messages])

  return (
    <main
      ref={scrollableContentRef}
      className="scale-80 flex min-h-full flex-col gap-4 overflow-y-scroll rounded-lg bg-zinc-100 p-5"
    >
      {messages.map((message) => (
        <Message key={message.id} sender={message.creator}>
          {message.creator === 'AI' ? <Avatar.Bot /> : null}
          <Message.Balloon
            sender={message.creator}
            message={message.text}
            date={message.createdAt}
          />
          {message.creator === 'USER' ? <Avatar.User /> : null}
        </Message>
      ))}
    </main>
  )
}

export default memo(Chat)
