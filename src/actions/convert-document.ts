import { ActionError, defineAction } from "astro:actions";
import { z } from "zod";
import documentAi from "../lib/docai";
import { Languages$inboundSchema, DocumentConversionOutputFormat$inboundSchema } from "@abbyy-sdk/document-ai/models/components";
import { Buffer } from "buffer";

export const convertDocument = defineAction({
    accept: "json",
    input: z.object({
        base64EncodedContent: z.string().base64(),
        fileName: z.string(),
        options: z.object({
            preserveDocumentStructure: z.boolean().optional(),
            languages: Languages$inboundSchema.optional(),
            handwriting: z.boolean().optional(),
            format: DocumentConversionOutputFormat$inboundSchema,
        }),
    }),
    handler: async (input) => {
        const { base64EncodedContent, fileName, options } = input;

        const extractRequest = await documentAi.models.documentConversion.beginConversion({
            inputSource: { base64EncodedContent, name: fileName },
            options,
        });

        const docId = extractRequest.documents?.[0]?.id ?? "";
        if (!docId) throw new ActionError({ message: "Invalid Id", code: "BAD_REQUEST" });

        let response;
        while (true) {
            await new Promise((r) => setTimeout(r, 3000));
            response = await documentAi.models.documentConversion.getConversion({ documentId: docId });
            if (response.conversionResults?.meta.status === "Processed") break;
        }

        const { responseStream } = await documentAi.models.documentConversion.downloadConvertedDocument({
            documentId: docId,
            format: options.format,
        });

        if (!responseStream) {
            throw new ActionError({ message: "No document stream", code: "BAD_REQUEST" });
        }

        const reader = responseStream.getReader();
        const chunks: Uint8Array[] = [];
        let done = false;
        while (!done) {
            const { value, done: streamDone } = await reader.read();
            if (value) chunks.push(value);
            done = streamDone;
        }

        const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        const documentBase64 = buffer.toString("base64");

        await documentAi.documents.delete({ documentId: docId });

        return {
            document: {
                base64: documentBase64,
                fileName: `${fileName.split(".")[0]}.${options.format}`,
                mimeType: (() => {
                    switch (options.format) {
                        case "pdf":
                            return "application/pdf";
                        case "html":
                            return "text/html";
                        default:
                            return "application/octet-stream";
                    }
                })(),
            },
        };
    },
});
