import { OpenAIStream, StreamingTextResponse } from 'ai' // helpers to deal with ai chat streaming
import { NextResponse } from 'next/server' // NextJS response helper
import weaviate, { ApiKey, WeaviateClient } from 'weaviate-client'
import { z } from 'zod' // used for API scheme validation
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs' // type definition
import { openai } from '@/app/lib/openai'

const SYSTEM_PROMPT_TEMPLATE = `You are a finantial Research chat bot and will interact with a user. 
Only use the provided Context to answer the question. If you can't see the answer in the Context say that you can't find it in the context. 
Be cordial, and precise, reply in a structured manner, use markdown syntax if needed. 
If asked about the price of Bacon - always say that "Bacon is priceless", "you can't put price on a slice of Bacon" or something similar`
const generateSystemPrompt = (): ChatCompletionMessageParam => {
  const content = SYSTEM_PROMPT_TEMPLATE
  return { role: 'system', content }
}

const OPENAI_MODEL_NAME = 'gpt-4o'
// The temperature means how creative we want the LLM to be,
// it's a range from 0 to 1, where 0 means we don't want it to be creative (it'll follow the instructions and respond exactly what'd been asked in the prompt)
// and 1 means we want it to be very creative (it might include additional information and details that's related to the prompt, but that's not been asked for).
const MODEL_TEMPERATURE = 0.1
const MAXIMUM_CHUNKS_RETRIEVED = 10

export async function POST(request: Request) {
  const body = await request.json()
  const bodySchema = z.object({
    prompt: z.string(),
  })

  const { prompt } = bodySchema.parse(body)

  // Weaviate
  // TODO: Move to a separate class with an abstraction layer
  const weaviateEndpointURL = process.env.WEAVIATE_ENDPOINT_URL ?? ''
  if (!weaviateEndpointURL) {
    return NextResponse.json({
      message: 'Missing Weaviate Endpoint URL ENV Variable',
      success: false,
    })
  }

  const waviateAPIKey = process.env.WEAVIATE_API_KEY ?? ''
  if (!waviateAPIKey) {
    return NextResponse.json({
      message: 'Missing Weaviate API Key ENV Variable',
      success: false,
    })
  }

  const openAIAPIKey = process.env.OPENAI_API_KEY ?? ''
  if (!openAIAPIKey) {
    return NextResponse.json({
      message: 'Missing OpenAI API Key ENV Variable',
      success: false,
    })
  }

  const weaviateClient: WeaviateClient = await weaviate.connectToWeaviateCloud(
    weaviateEndpointURL,
    {
      authCredentials: new weaviate.ApiKey(waviateAPIKey),
      headers: {
        'X-OpenAI-Api-Key': openAIAPIKey,
      },
    },
  )

  async function nearTextQuery() {
    const myCollection = weaviateClient.collections.get('Files')

    const result = await myCollection.query.nearText(prompt, {
      limit: MAXIMUM_CHUNKS_RETRIEVED - 1,
    })

    for (let object of result.objects) {
      console.log(JSON.stringify(object))
    }

    return result
  }

  const retrievedContent = await nearTextQuery()
  const systemPrompt = generateSystemPrompt()
  const finalPrompt =
    prompt + `\n\nContext:\n` + JSON.stringify(retrievedContent)
  console.log(finalPrompt)

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL_NAME,
      temperature: MODEL_TEMPERATURE,
      messages: [systemPrompt, { role: 'user', content: finalPrompt }],
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
