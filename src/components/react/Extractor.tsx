import React, { useState, type ChangeEvent } from "react";
import { actions } from "astro:actions";
import JsonOutput from "./JsonOutput";
import { useFileReader } from "./shared";

interface ModelOption {
    label: string;
    action: keyof typeof actions;
    category: string;
}

const MODEL_OPTIONS: ModelOption[] = [
    { label: "Invoice", action: "extractInvoice", category: "Accounts Payable" },
    // …
];

export default function Extractor() {
    // model selection
    const [selectedAction, setSelectedAction] = useState<ModelOption>(MODEL_OPTIONS[0]);

    // file + base64 logic pulled into hook
    const { file, base64, onFileChange } = useFileReader();

    const [result, setResult] = useState<string>(JSON.stringify({ data: "will", appear: { excactly: "here" } }, null, 4));
    const [loading, setLoading] = useState(false);

    // group by category for optgroups
    const grouped = MODEL_OPTIONS.reduce<Record<string, ModelOption[]>>((acc, opt) => {
        (acc[opt.category] ||= []).push(opt);
        return acc;
    }, {});

    const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const opt = MODEL_OPTIONS.find((m) => m.action === e.target.value);
        if (opt) setSelectedAction(opt);
    };

    const handleConfirm = async () => {
        if (!base64 || !file) return;
        setLoading(true);
        setResult("");

        try {
            const actionFn = (actions as any)[selectedAction.action] as Function;
            const { data, error } = await actionFn({
                base64EncodedContent: base64,
                fileName: file.name,
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
