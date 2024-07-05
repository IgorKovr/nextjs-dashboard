'use client'

import { useCompletion } from 'ai/react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import Chat from '@/app/ui/chat/Chat'
import { useFile, useMessages } from '@/app/lib/store'

async function uploadFile(file: File) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/embed', {
      method: 'POST',
      body: formData,
    })
    if (response.ok) {
      console.log('Embedding successful!')
    } else {
      const errorResponse = await response.text()
      throw new Error(`Embedding failed: ${errorResponse}`)
    }
  } catch (error) {
    throw new Error(`Error during embedding: ${error}`)
  }
}

const Home = () => {
    const {messages, setMessages, clearMessages} = useMessages()
    const {file, setFile, clear: clearFile} = useFile()
    const [isUploading, setIsUploading] = useState(false)
  
    const {input, setInput, handleInputChange, handleSubmit, completion, isLoading} = useCompletion({
      api: `/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
      if (!input) {
        e.preventDefault()
        return
      }
      Promise.all([handleSubmit(e)])
  
      setMessages('USER', input)
      setInput('')
    }

    const handleFileSelected = async (event?: ChangeEvent<HTMLInputElement>) => {
      setIsUploading(true)
      if (!event) return clearFile()
      const {files} = event.currentTarget
  
      if (!files?.length) {
        return
      }
  
      const selectedFile = files[0]
  
      try {
        await uploadFile(selectedFile)
        setFile(selectedFile)
      } catch (error) {
        console.error(error)
        throw(error)
      } finally {
        setIsUploading(false)
      }
  
      event.target.value = '' // clear input as we handle the file selection in state
    }
  
    useEffect(() => {
      if (!completion || !isLoading) return
      setMessages('AI', completion)
    }, [setMessages, completion, isLoading])
  
    return (
      <div className="z-10 flex h-full flex-col gap-5 p-0">
        <header className="flex items-center justify-between border-b px-6 py-3">
          {/* "flex" class sets the display property to flex for the header element.
              "items-center" class aligns the items in the header along the center of the cross-axis.
              "justify-between" class justifies the content in the header with space between the items.
              "border-b" class adds a bottom border to the header element.*/}
          <h1 className="text-xl font-bold">AI Chat</h1>
        </header>
        <div className="flex-grow flex-col items-center gap-3">
        <Chat messages={messages} />
        </div>
        <Chat.Input
          onChange={handleInputChange}
          value={input}
          onSubmit={onSubmit}
          disabled={isLoading}
          onFileSelected={handleFileSelected}
          file={file}
          isUploading={isUploading}
        />
        <div
          className="flex cursor-pointer items-center gap-2 text-xs text-red-500"
          onClick={clearMessages}>
          <TrashIcon className="h-4 w-4" />Clear Chat
        </div>
      </div>
    )
  }
  
  export default Home
  