import { DocumentAi } from "@abbyy-sdk/document-ai";
import { DOCAI_API_KEY } from "astro:env/server";

const documentAi = new DocumentAi({
  apiKeyAuth: DOCAI_API_KEY,
});

export default documentAi;