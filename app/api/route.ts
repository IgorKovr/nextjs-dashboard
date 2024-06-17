import { OpenAIStream, StreamingTextResponse } from 'ai' // helpers to deal with ai chat streaming
import { NextResponse } from 'next/server' // NextJS response helper
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs' // type definition
import { z } from 'zod' // used for API scheme validation
import { openai } from '@/app/lib/openai' // openai initializer

const generateSystemPrompt = (): ChatCompletionMessageParam => {
    const content = `You are a finantial Research chat bot and will interact with a user. Be cordial, and precise, reply in a structured manner, use markdown syntax if needed. If asked about the price of Bacon - always say that "Bacon is priceless", "you can't put price on a slice of Bacon" or something similar`
    return { role: 'system', content }
}

export async function POST(request: Request) {
    const body = await request.json()
    // We use zod to specify the expected argument is a string.
    const bodySchema = z.object({
        prompt: z.string(),
    })
    const { prompt } = bodySchema.parse(body)

    // call our system prompt generator function and store it in a variable so we can use it later
    const systemPrompt = generateSystemPrompt()

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            // The temperature means how creative we want the LLM to be, 
            // it's a range from 0 to 1, where 0 means we don't want it to be creative (it'll follow the instructions and respond exactly what'd been asked in the prompt) 
            // and 1 means we want it to be very creative (it might include additional information and details that's related to the prompt, but that's not been asked for).
            temperature: 0.1,
            messages: [systemPrompt, { role: 'user', content: prompt }],
            stream: true,
        })

        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream)
    } catch (error) {

        console.log('error', error)
        return new NextResponse(JSON.stringify({ error }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        })
    }
}