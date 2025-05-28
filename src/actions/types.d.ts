import { DocumentAi } from "@abbyy-sdk/document-ai";

/**
 * All keys available on an instance’s `models` object
 */
export type AllModels = keyof InstanceType<typeof DocumentAi>["models"];

/**
 * ExtractionModel excludes the two non-extraction models
 * and any private (underscore-prefixed) properties
 */
export type ExtractionModel = Exclude<AllModels, "documentConversion" | "imageToText" | `_${string}`>;
