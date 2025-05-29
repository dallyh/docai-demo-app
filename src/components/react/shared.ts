import { useState, type ChangeEvent, useCallback, useEffect } from "react";

interface Document {
	url: string;
	fileName: string;
	fileType: string;
}

export function useFileReader() {
	const [file, setFile] = useState<File | null>(null);
	const [base64, setBase64] = useState<string | null>(null);
	const [doc, setDoc] = useState<Document | null>(null);

	useEffect(() => {
		return () => {
			if (doc) {
				URL.revokeObjectURL(doc.url);
			}
		};
	}, [doc]);

	const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const chosen = e.target.files?.[0] ?? null;

		if (!chosen) {
			setFile(null);
			setBase64(null);
			setDoc(null);
			return;
		}

		const url = URL.createObjectURL(chosen);

		setDoc({
			url: url,
			fileName: chosen.name,
			fileType: chosen.type,
		});

		setFile(chosen);

		const reader = new FileReader();
		reader.readAsDataURL(chosen);
		reader.onload = () => {
			const dataUrl = reader.result as string;
			setBase64(dataUrl.split(",")[1]);
		};
	}, []);

	return { file, base64, doc, onFileChange };
}
