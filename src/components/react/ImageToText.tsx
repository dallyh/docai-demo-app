import React, { useState, type ChangeEvent } from "react";
import { actions } from "astro:actions";
import { useFileReader } from "./shared";
import { BeginImageToTextTextExtractionRequestBodyLanguages } from "@abbyy-sdk/document-ai/models/components";
import DocumentViewer from "./DocumentViewer";
import FileInput from "./FileInput";
import JsonHighlight from "./JsonHighlight";

export default function ImageToText() {
	const { file, base64, doc, onFileChange } = useFileReader();

	const [handwriting, setHandwriting] = useState(false);
	const [preserveDocumentStructure, setPreserveDocumentStructure] = useState(false);
	const [language, setLanguage] = useState<BeginImageToTextTextExtractionRequestBodyLanguages>(BeginImageToTextTextExtractionRequestBodyLanguages.En);

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
			else setResult(JSON.stringify(data, null, 2));
		} catch (err: any) {
			setResult(`Error: ${err.message}`);
		}

		setLoading(false);
	};

	return (
		<div className="flex flex-col gap-4">
			<fieldset className="fieldset">
				<legend className="fieldset-legend">Options</legend>

				<label className="label">
					<input type="checkbox" className="toggle toggle-primary" onChange={(e: ChangeEvent<HTMLInputElement>) => setHandwriting(e.target.checked)} />
					Handwriting
				</label>

				<label className="label">
					<input type="checkbox" className="toggle toggle-primary" onChange={(e: ChangeEvent<HTMLInputElement>) => setPreserveDocumentStructure(e.target.checked)} />
					Preserve document structure
				</label>

				<label className="label">Language</label>
				<select className="select w-full" defaultValue={language} onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as BeginImageToTextTextExtractionRequestBodyLanguages)}>
					{Object.values(BeginImageToTextTextExtractionRequestBodyLanguages).map((v) => (
						<option key={v} value={v}>
							{v}
						</option>
					))}
				</select>
			</fieldset>

			<FileInput loading={loading} onChange={onFileChange} />

			{doc && <DocumentViewer {...doc} />}

			<button className="btn btn-primary btn-outline" onClick={handleConfirm} disabled={!base64 || loading}>
				{loading ? (
					<>
						<span className="loading loading-spinner" /> Processing…
					</>
				) : (
					"Confirm & Extract"
				)}
			</button>

			<JsonHighlight jsonData={result} />
		</div>
	);
}
