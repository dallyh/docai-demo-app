import React, { useState, type ChangeEvent } from "react";
import { actions } from "astro:actions";
import { useFileReader } from "./shared";
import { BeginImageToTextTextExtractionRequestBodyLanguages } from "@abbyy-sdk/document-ai/models/components";

export default function ImageToText() {
    // file + base64 logic pulled into hook
    const { file, base64, onFileChange } = useFileReader();

    // user-configurable options
    const [handwriting, setHandwriting] = useState(false);
    const [preserveDocumentStructure, setPreserveDocumentStructure] = useState(false);
    const [language, setLanguage] = useState<BeginImageToTextTextExtractionRequestBodyLanguages>(
        BeginImageToTextTextExtractionRequestBodyLanguages.En
    );

    const [result, setResult] = useState<string>(JSON.stringify({ data: "will", appear: { excactly: "here" } }, null, 4));
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!base64 || !file) return;
        setLoading(true);
        setResult("");

        try {
            const { data, error } = await actions.imageToText({
                base64EncodedContent: base64,
                fileName: file.name,
                options: {
                    handwriting,
                    preserveDocumentStructure,
                    languages: language,
                },
            });

            if (error) setResult(`Error: ${error.message}`);
            else setResult(JSON.stringify(data.fields, null, 2));
        } catch (err: any) {
            setResult(`Error: ${err.message}`);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Handwriting</legend>
                <select
                    className="select"
                    value={handwriting ? "Yes" : "No"}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setHandwriting(e.target.value === "Yes")}
                >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Preserve document structure</legend>
                <select
                    className="select"
                    value={preserveDocumentStructure ? "Yes" : "No"}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setPreserveDocumentStructure(e.target.value === "Yes")}
                >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Language</legend>
                <select
                    className="select"
                    value={language}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setLanguage(e.target.value as BeginImageToTextTextExtractionRequestBodyLanguages)
                    }
                >
                    {Object.values(BeginImageToTextTextExtractionRequestBodyLanguages).map((v) => (
                        <option key={v} value={v} selected={v === "en" ? true : false}>
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

            <button className="btn btn-primary btn-outline" onClick={handleConfirm} disabled={!base64 || loading}>
                {loading ? "Processing…" : "Confirm & Extract"}
            </button>

            <textarea
                className="textarea textarea-bordered w-full h-64 font-mono"
                placeholder="API output will appear here…"
                value={result}
                readOnly
            />
        </div>
    );
}
