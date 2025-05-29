import { convertDocument } from "./convert-document";
import { extractDocument } from "./extract-document";
import { imageToText } from "./image-to-text";
export const server = {
	extractDocument,
	imageToText,
	convertDocument,
};
