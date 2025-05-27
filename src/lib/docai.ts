import { DocumentAi } from "@abbyy-sdk/document-ai";

const documentAi = new DocumentAi({
  apiKeyAuth: import.meta.env.DOCAI_API_KEY,
});

export default documentAi;