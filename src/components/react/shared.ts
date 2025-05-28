import { useState, type ChangeEvent, useCallback } from "react";

export function useFileReader() {
    const [file, setFile] = useState<File | null>(null);
    const [base64, setBase64] = useState<string | null>(null);

    const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const chosen = e.target.files?.[0] ?? null;
        if (!chosen) {
            setFile(null);
            setBase64(null);
            return;
        }

        setFile(chosen);

        const reader = new FileReader();
        reader.readAsDataURL(chosen);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setBase64(dataUrl.split(",")[1]);
        };
    }, []);

    return { file, base64, onFileChange };
}
