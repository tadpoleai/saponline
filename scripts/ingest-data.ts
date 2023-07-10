import { RecursiveCharacterTextSplitter, MarkdownTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';



import { UnstructuredDirectoryLoader, UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));


/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = 'txts';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.txt': (path) => new TextLoader(path),
    });


    // markdown directory
    /*
    const options = {
      apiKey: "MY_API_KEY",
    };
    
    const loader = new UnstructuredDirectoryLoader(
      "langchain/src/document_loaders/tests/example_data",
      options
    );
    const docs = await loader.load();
    */

    
    // load markdown
    /*
    const options = {
      apiKey: "e6Z9oQAy533ErBZHTd8zXEdnkFeagl",
    };

    const directoryPath = filePath;
    const loader = new UnstructuredDirectoryLoader(directoryPath, options);


    const file_loader = new UnstructuredLoader(
      path.resolve(__dirname, "../docs/sap01.md"),
      options
    );
    */
    

    const rawDocs = await directoryLoader.load();


      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 200,
      });
  
  
      const docs = await textSplitter.splitDocuments(rawDocs);


    // console.log(rawDocs.values)
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();

    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name


    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
