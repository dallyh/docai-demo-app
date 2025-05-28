import { convertDocument } from "./convert-document"
import { extractInvoice } from "./extract-invoice"
import { imageToText } from "./image-to-text"
export const server = {
    extractInvoice,
    imageToText,
    convertDocument
  }