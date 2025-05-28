import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";
import documentAi from "../lib/docai";
import { DocumentAi } from "@abbyy-sdk/document-ai";
import type { ExtractionModel } from "./types";

const models = Object.getOwnPropertyNames(Object.getPrototypeOf(documentAi.models) as InstanceType<typeof DocumentAi>["models"]).filter(
    (key): key is ExtractionModel => key !== "constructor" && key !== "documentConversion" && key !== "imageToText" && !key.startsWith("_")
);

export const extractDocument = defineAction({
    accept: "json",
    input: z.object({
        base64EncodedContent: z.string().base64(),
        fileName: z.string(),
        model: z.enum(models as [ExtractionModel, ...ExtractionModel[]]),
    }),
    handler: async (input) => {
        const { base64EncodedContent, fileName, model } = input;

        // grab the right model-specific API
        const api = documentAi.models[model];

        if (!api) {
            throw new ActionError({
                message: "Incorrect model!",
                code: "BAD_REQUEST",
            });
        }

        //@ts-ignore this fails checks
        const extractReq = await api.beginFieldExtraction({
            inputSource: { base64EncodedContent, name: fileName },
        });

        const docId = extractReq.documents?.[0]?.id || "";
        if (!docId) {
            throw new ActionError({
                message: "Failed to get document ID from extraction request",
                code: "INTERNAL_SERVER_ERROR",
            });
        }

        let response: any;
        let status: string | undefined;
        do {
            await new Promise((r) => setTimeout(r, 1000));
            //@ts-ignore this fails checks
            response = await api.getExtractedFields({ documentId: docId });
            status = response[model]?.meta?.status;
        } while (status !== "Processed");

        try {
            await documentAi.documents.delete({ documentId: docId });
        } catch (err) {
            console.warn("Error deleting document:", err);
        }

        const extractedFields = response[model]?.fields ?? {};
        return {
            fields: JSON.parse(JSON.stringify(extractedFields)),
        };
    },
});
