import { useState, useEffect, type ChangeEvent } from "react";

export interface DocumentViewerProps {
	/**
	 * The URL of the document to display (blob URL, data URL, or remote URL)
	 */
	url: string;
	/**
	 * Optional file name for accessibility or header display
	 */
	fileName?: string;
	/**
	 * MIME type of the file (e.g., 'application/pdf', 'image/png', 'text/plain')
	 */
	fileType?: string;
	/**
	 * Width of the viewer (CSS string or number)
	 * @default '100%'
	 */
}

export default function DocumentViewer({ url, fileName, fileType }: DocumentViewerProps) {
	const [textContent, setTextContent] = useState<string>("");
	const [showPreview, setShowPreview] = useState(false);

	const width = "100%";

	useEffect(() => {
		// If text-based file, load its content
		if (fileType?.startsWith("text/")) {
			fetch(url)
				.then((res) => res.text())
				.then((text) => setTextContent(text))
				.catch(() => setTextContent("Error loading text content."));
		}
	}, [url, fileType]);

	const onShowPreviewCallback = (e: ChangeEvent<HTMLInputElement>) => {
		setShowPreview(e.target.checked);
	};

	const renderContent = () => {
		if (fileType?.startsWith("image/")) {
			if (fileType === "image/tiff") {
				return <p>No preview available for this file type.</p>;
			}

			return (
				<img
					src={url}
					alt={fileName}
					style={{
						width,
						height: "max-content",
						objectFit: "contain",
					}}
				/>
			);
		}

		if (fileType === "application/pdf") {
			return (
				<iframe
					src={url}
					title={fileName}
					style={{
						width,
						height: "80svh",
						border: "none",
					}}
				/>
			);
		}

		if (fileType?.startsWith("text/")) {
			return (
				<pre
					style={{
						width,
						height: "max-content",
						overflow: "auto",
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
						padding: "1rem",
						background: "#f5f5f5",
					}}
				>
					{textContent}
				</pre>
			);
		}

		return <p>No preview available for this file type.</p>;
	};

	return (
		<div>
			<label className="label">
				<input type="checkbox" className="toggle toggle-primary" onChange={onShowPreviewCallback} />
				Show preview
			</label>
			{showPreview && <div className="mt-4">{renderContent()}</div>}
		</div>
	);
}
