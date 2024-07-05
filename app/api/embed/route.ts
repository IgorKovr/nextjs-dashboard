import { NextResponse } from 'next/server'
import weaviate, { vectorizer, generative, WeaviateClient } from 'weaviate-client'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

// Embedding model
// More information on available openAI Embedding models:
// https://openai.com/index/new-embedding-models-and-api-updates/
const OPENAI_EMBEDDING_MODEL = `text-embedding-3-small`
// const OPENAI_EMBEDDING_MODEL = `text-embedding-3-large`

// Available dimensions:
// text-embedding-3-large: 256, 1024, 3072 (default)
// text-embedding-3-small: 512, 1536 (default)
const VECTOR_DB_DIMENTIONS = 1536

// Function to embed the data to a Vactor DB
export async function POST(request: Request) {
  const data = request.formData()
  
  // Weaviate
  // TODO: Move to a separate class with an abstraction layer
  const waviateAPIKey = process.env.WEAVIATE_API_KEY ?? ''
  if (!waviateAPIKey) {
    console.log('Missing Weaviate API Key ENV Variable')
    return NextResponse.json({ message: 'Missing Weaviate API Key ENV Variable', success: false });
  }

  const openAIAPIKey = process.env.OPENAI_API_KEY ?? ''
  if (!openAIAPIKey) {
    console.log('Missing OpenAI API Key ENV Variable')
    return NextResponse.json({ message: 'Missing OpenAI API Key ENV Variable', success: false });
  }
  
  const weaviateEndpointURL = process.env.WEAVIATE_ENDPOINT_URL ?? ''
  if (!weaviateEndpointURL) {
    console.log('Missing Weaviate Endpoint URL ENV Variable')
    return NextResponse.json({ message: 'Missing Weaviate Endpoint URL ENV Variable', success: false });
  }

  const file: File | null = (await data).get('file') as unknown as File
  if (!file) {
    console.log('Missing file input')
    return NextResponse.json({message: 'Missing file input', success: false})
  }

  const weaviateClient: WeaviateClient = await weaviate.connectToWeaviateCloud(
    weaviateEndpointURL, {
      authCredentials: new weaviate.ApiKey(waviateAPIKey),
      headers: {
        'X-OpenAI-Api-Key': openAIAPIKey,
      }
    }
  )

  // TODO: Add a check if the Storage exist and recreate one when needed
  // createStorage(weaviateClient)

  // File Loaders
  // PDF Loader 
  // TODO: Support more filetypes

  const loader = new PDFLoader(file, { splitPages: false })
  const docs = await loader.load() 

  // Because we use 'splitPages: false', 
  // the PDFLoader will concatenate the pages together availablbe at [0] position of an Array, 
  // this helps us down the chain with the text splitting.
  const fileContent = docs[0].pageContent
  const fileTitle = docs[0].metadata.title

  console.log(docs[0].pageContent)
  console.log(docs[0].metadata)

  // Text Splitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators:['\n']
  })

  // TODO: Populate chunks with metadata (context, title, summarization) 
  const splitDocs = await textSplitter.createDocuments([fileContent])
  const mappedDocs = splitDocs.map((doc, index) => ({
    title: fileTitle,
    content: doc.pageContent,
    chunk: `chunk ${index + 1}`,
    metadata: doc.metadata
  }))

  console.log(fileContent)  

  await uploadDataToWeaviate(weaviateClient, mappedDocs, file);

  return new NextResponse(JSON.stringify({success: true}), {
    status: 200,
    headers: {'content-type': 'application/json'},
  })
}

async function createStorage(weaviateClient: WeaviateClient) {
  await weaviateClient.collections.create({
    name: 'Files',
    properties: [
      {
        name: 'title',
        dataType: 'text' as const,
      },
    ],
    vectorizers: [
      weaviate.configure.vectorizer.text2VecOpenAI({
        name: 'title_vector',
        sourceProperties: ['title'],
        model: OPENAI_EMBEDDING_MODEL,
        dimensions: VECTOR_DB_DIMENTIONS
        },
      ),
    ],
  });
}

async function uploadDataToWeaviate(weaviateClient: WeaviateClient, mappedDocs: any[], file: File | null) {
  const filesCollection = weaviateClient.collections.get('Files');
  const response = await filesCollection.data.insertMany(mappedDocs)
  console.log('File chunked and uploaded to Weaviate Vector DB:', file?.name, response);
}