import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import documentAi from "../lib/docai";

export const extractInvoice = defineAction({
    accept: "json",
    input: z.object({ base64EncodedContent: z.string().base64(), fileName: z.string() }),
    handler: async (input) => {
        const { base64EncodedContent, fileName } = input;

        const extractRequest = await documentAi.models.invoice.beginFieldExtraction({
            inputSource: { base64EncodedContent, name: fileName },
        });

        const docId = extractRequest.documents?.[0]?.id ?? "";

        if (docId === "") {
            throw new ActionError({ message: "Invalid Id", code: "BAD_REQUEST" });
        }

        let processed, response;
        while (!processed) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            response = await documentAi.models.invoice.getExtractedFields({
                documentId: docId,
            });
            processed = response.invoice?.meta.status === "Processed";
        }

        const extracted = response?.invoice?.fields ?? {};
        const plain = JSON.parse(JSON.stringify(extracted));
        return { fields: plain };
    },
});
