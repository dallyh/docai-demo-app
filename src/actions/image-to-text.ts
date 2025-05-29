import { ActionError, defineAction } from "astro:actions";
import { z } from "zod";
import documentAi from "../lib/docai";
import { BeginImageToTextTextExtractionRequestBodyLanguages$inboundSchema } from "@abbyy-sdk/document-ai/models/components";

export const imageToText = defineAction({
	accept: "json",
	input: z.object({
		base64EncodedContent: z.string().base64(),
		fileName: z.string(),
		options: z.object({
			preserveDocumentStructure: z.boolean().optional(),
			languages: BeginImageToTextTextExtractionRequestBodyLanguages$inboundSchema.optional(),
			handwriting: z.boolean().optional(),
		}),
	}),
	handler: async (input) => {
		const { base64EncodedContent, fileName, options } = input;

		const extractRequest = await documentAi.models.imageToText.beginTextExtraction({
			inputSource: { base64EncodedContent, name: fileName },
			options,
		});

		const docId = extractRequest.documents?.[0]?.id ?? "";

		if (docId === "") {
			throw new ActionError({ message: "Invalid Id", code: "INTERNAL_SERVER_ERROR" });
		}

		let processed, response;
		while (!processed) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			response = await documentAi.models.imageToText.getExtractedText({
				documentId: docId,
			});
			processed = response.extractedText?.meta.status === "Processed";
		}

		try {
			await documentAi.documents.delete({
				documentId: docId,
			});

			console.log("Deleted document :" + docId);
		} catch (err) {
			console.log("Document delete error :" + err);
		}

		const data = response?.extractedText ?? {};
		const plain = JSON.parse(JSON.stringify(data));
		return { fields: plain };
	},
});
