import { NextResponse } from 'next/server'
import weaviate, { vectorizer, generative, WeaviateClient } from 'weaviate-client'

// Function to embed the data to a Vactor DB
export async function POST(request: Request) {
  const data = request.formData()
  
  const waviateAPIKey = process.env.WEAVIATE_API_KEY ?? ''
  if (!waviateAPIKey) {
    return NextResponse.json({ message: 'Missing Weaviate API Key ENV Variable', success: false });
  }

  const openAIAPIKey = process.env.OPENAI_API_KEY ?? ''
  if (!openAIAPIKey) {
    return NextResponse.json({ message: 'Missing OpenAI API Key ENV Variable', success: false });
  }
  
  const weaviateEndpointURL = process.env.WEAVIATE_ENDPOINT_URL ?? ''
  if (!weaviateEndpointURL) {
    return NextResponse.json({ message: 'Missing Weaviate Endpoint URL ENV Variable', success: false });
  }

  const file: File | null = (await data).get('file') as unknown as File
  if (!file) {
    return NextResponse.json({message: 'Missing file input', success: false})
  }

  const fileContent = await file.text()
  const fileTitle = await file.name

  const weaviateClient: WeaviateClient = await weaviate.connectToWeaviateCloud(
    weaviateEndpointURL, {
      authCredentials: new weaviate.ApiKey(waviateAPIKey),
      headers: {
        'X-OpenAI-Api-Key': openAIAPIKey,
      }
    }
  )

  async function uploadDataToWeaviate() {
    const filesCollection = weaviateClient.collections.get('Files');
    const response = await filesCollection.data.insert({title: fileTitle, content: fileContent})
    console.log('File uploaded to Weaviate DB:', file?.name, response);
  }

  await uploadDataToWeaviate();

  return new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'},
  })
}

  // // TODO: TMP for Debugging; If you are connected, the server returns True.
  // // const weaviateIsReady = await weaviateClient.isReady()
  // // console.log(weaviateIsReady)
  
  // // Define a collection
  // // TODO: Run Once! (Then check if the collection is there)
  // async function createCollection() {
  //   const questions = await weaviateClient.collections.create({
  //     name: 'Files',
  //     properties: [
  //       {
  //         name: 'title',
  //         dataType: 'text' as const,
  //       },
  //     ],
  //     vectorizers: [
  //       weaviate.configure.vectorizer.text2VecOpenAI({ 
  //         name: 'title_vector',
  //         sourceProperties: ['title'],
  //         },
  //       ),
  //     ],
  //     generative: generative.openAI(),
  //   })
  //   console.log(`Collection ${questions.name} created!`)
  // }

  // await createCollection()