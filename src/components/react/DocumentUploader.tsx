import React, { useState, type ChangeEvent } from "react";
import { actions } from "astro:actions";

interface ModelOption {
    label: string;
    action: keyof typeof actions;
    category: string;
}

const MODEL_OPTIONS: ModelOption[] = [
    { label: "Invoice", action: "extractInvoice", category: "Accounts Payable" },
    //{ label: 'Receipt',    action: 'extractReceipt',  category: 'Accounts Payable' },
    //{ label: 'Passport',   action: 'extractKYC',      category: 'Know Your Customer' },
    //{ label: 'ID Card',    action: 'extractKYC',      category: 'Know Your Customer' },
    // …add more here
];

export default function DocumentUploader() {
    const [selectedAction, setSelectedAction] = useState<ModelOption>(MODEL_OPTIONS[0]);
    const [file, setFile] = useState<File | null>(null);
    const [base64Content, setBase64Content] = useState<string | null>("");
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // group by category for optgroups
    const grouped = MODEL_OPTIONS.reduce<Record<string, ModelOption[]>>((acc, opt) => {
        (acc[opt.category] ||= []).push(opt);
        return acc;
    }, {});

    const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const opt = MODEL_OPTIONS.find((m) => m.action === e.target.value);
        if (opt) setSelectedAction(opt);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const chosen = e.target.files?.[0] ?? null;
        if (!chosen) {
          setFile(null);
          setBase64Content(null);
          return;
        }

        setFile(chosen);

        const reader = new FileReader();
        reader.readAsDataURL(chosen);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(",")[1];
            setBase64Content(base64);
        };
    };

    const handleConfirm = async () => {
        if (!base64Content || !file) return;
        setLoading(true);
        setResult("");

        try {
            const actionFn = (actions as any)[selectedAction.action] as Function;
            const { data, error } = await actionFn({
                base64EncodedContent: base64Content,
                fileName: file.name,
            });

            if (error) {
                setResult(`Error: ${error.message}`);
            } else {
                setResult(JSON.stringify(data.fields, null, 2));
            }
        } catch (err: any) {
            setResult(`Error: ${err.message}`);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Select Model</span>
                </label>
                <select className="select select-bordered w-full" value={selectedAction.action} onChange={handleModelChange}>
                    {Object.entries(grouped).map(([cat, opts]) => (
                        <optgroup key={cat} label={cat}>
                            {opts.map((opt) => (
                                <option key={opt.action} value={opt.action}>
                                    {opt.label}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            <input type="file" accept="image/*,.pdf" className="file-input w-full file-input-primary" disabled={loading} onChange={handleFileChange} />

            <button className="btn btn-primary btn-outline" onClick={handleConfirm} disabled={!base64Content || loading}>
                {loading ? "Processing…" : "Confirm & Extract"}
            </button>

            <textarea
                className="textarea textarea-bordered w-full h-64 font-mono"
                placeholder="DocAI API output will appear here…"
                value={result}
                readOnly
            />
        </div>
    );
}
