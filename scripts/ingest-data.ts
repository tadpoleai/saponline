import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { UnstructuredDirectoryLoader, UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));


/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = 'md';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    // const directoryLoader = new DirectoryLoader(filePath, {
    //   '.pdf': (path) => new PDFLoader(path),
    // });

    const options = {
      apiKey: "e6Z9oQAy533ErBZHTd8zXEdnkFeagl",
    };

    const directoryPath = filePath;
    const loader = new UnstructuredDirectoryLoader(directoryPath, options);


    const file_loader = new UnstructuredLoader(
      path.resolve(__dirname, "../docs/sap01.md"),
      options
    );


    // const rawDocs = await loader.load();
    const rawDocs = await file_loader.load();


    // const loader = new PDFLoader(filePath);
    // const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    console.log('1');

    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
    console.log('2');


    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: '',
      textKey: 'text',
    });
    console.log('3');

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
