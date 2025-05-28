import React, { useState, type ChangeEvent } from "react";
import { actions } from "astro:actions";
import { useFileReader } from "./shared";
import { Languages, DocumentConversionOutputFormat } from "@abbyy-sdk/document-ai/models/components";
import DocumentViewer from "./DocumentViewer";

export default function ConvertDocument() {
    const { file, base64, doc, onFileChange } = useFileReader();

    const [handwriting, setHandwriting] = useState(false);
    const [preserveDocumentStructure, setPreserveDocumentStructure] = useState(false);
    const [language, setLanguage] = useState<Languages>(Languages.En);
    const [format, setFormat] = useState<DocumentConversionOutputFormat>(DocumentConversionOutputFormat.Pdf);

    const [resultText, setResultText] = useState<string>("");
    const [docBase64, setDocBase64] = useState<string | null>(null);
    const [docFileName, setDocFileName] = useState<string>("");
    const [docMimeType, setDocMimeType] = useState<string>("");

    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!base64 || !file) return;
        setLoading(true);
        setResultText("");
        setDocBase64(null);

        try {
            const { data, error } = await actions.convertDocument({
                base64EncodedContent: base64,
                fileName: file.name,
                options: {
                    handwriting,
                    preserveDocumentStructure,
                    languages: language,
                    format,
                },
            });

            if (error) {
                setResultText(`Error: ${error.message}`);
            } else {
                setResultText("Complete...");

                // stash the returned file for download
                if (data.document) {
                    setDocBase64(data.document.base64);
                    setDocFileName(data.document.fileName);
                    setDocMimeType(data.document.mimeType);
                }
            }
        } catch (err: any) {
            setResultText(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!docBase64) return;

        // convert base64 back into binary
        const byteChars = atob(docBase64);
        const bytes = new Uint8Array(Array.from(byteChars).map((c) => c.charCodeAt(0)));
        const blob = new Blob([bytes], { type: docMimeType });
        const url = URL.createObjectURL(blob);

        // programmatically click an <a> to download
        const a = document.createElement("a");
        a.href = url;
        a.download = docFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-4">
            <fieldset className="fieldset w-full">
                <legend className="fieldset-legend">Options</legend>

                <label className="label">
                    <input
                        type="checkbox"
                        className="toggle"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setHandwriting(e.target.checked)}
                    />
                    Handwriting
                </label>

                <label className="label">
                    <input
                        type="checkbox"
                        className="toggle"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPreserveDocumentStructure(e.target.checked)}
                    />
                    Preserve document structure
                </label>

                <label className="label">Language</label>
                <select
                    className="select w-full"
                    defaultValue={language}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as Languages)}
                >
                    {Object.values(Languages).map((v) => (
                        <option key={v} value={v}>
                            {v}
                        </option>
                    ))}
                </select>

                <label className="label">Format</label>
                <select
                    className="select w-full"
                    defaultValue={format}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value as DocumentConversionOutputFormat)}
                >
                    {Object.values(DocumentConversionOutputFormat).map((v) => (
                        <option key={v} value={v}>
                            {v}
                        </option>
                    ))}
                </select>
            </fieldset>

            <input
                type="file"
                accept="image/*,.pdf"
                className="file-input w-full file-input-primary"
                disabled={loading}
                onChange={onFileChange}
            />

            {doc && <DocumentViewer {...doc} />}

            <button className="btn btn-primary btn-outline" onClick={handleConfirm} disabled={!base64 || loading}>
                {loading ? (
                    <>
                        <span className="loading loading-spinner" /> Processing…
                    </>
                ) : (
                    "Confirm & Convert"
                )}
            </button>

            <button className="btn btn-success" onClick={handleDownload} disabled={!docBase64}>
                Download Converted File
            </button>

            {resultText && (
                <textarea
                    className="textarea textarea-bordered w-full h-64 font-mono"
                    placeholder="API output will appear here…"
                    value={resultText}
                    readOnly
                />
            )}
        </div>
    );
}
