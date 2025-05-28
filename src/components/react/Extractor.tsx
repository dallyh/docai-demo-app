import { useState, type ChangeEvent } from "react";
import { actions } from "astro:actions";
import { useFileReader } from "./shared";
import DocumentViewer from "./DocumentViewer";
import type { ExtractionModel } from "src/actions/types";

interface ModelOption {
    label: string;
    model: ExtractionModel;
    category: string;
}

const MODEL_LABELS: Record<ExtractionModel, string> = {
    // Accounts Payable
    invoice: "Invoice",
    purchaseOrder: "Purchase Order",
    remittanceAdvice: "Remittance Advice",

    // Expenses
    receipt: "Receipt",
    hotelInvoice: "Hotel Invoice",
    taxiReceipt: "Taxi Receipt",
    utilityBill: "Utility Bill",

    // Tax & HR
    usForm1040: "US Form 1040",
    usFormW2: "US Form W-2",

    // Finance
    personalEarningsStatement: "Personal Earnings Statement",
    bankStatement: "Bank Statement",
    brokerageStatement: "Brokerage Statement",

    // Logistics / Shipping
    deliveryNote: "Delivery Note",
    airWaybill: "Air Waybill",
    arrivalNotice: "Arrival Notice",
    billOfLading: "Bill of Lading",
    certificateOfOrigin: "Certificate of Origin",
    commercialInvoice: "Commercial Invoice",
    dangerousGoodsDeclaration: "Dangerous Goods Declaration",
    customsDeclaration: "Customs Declaration",
    packingList: "Packing List",
    seaWaybill: "Sea Waybill",
    internationalConsignmentNote: "International Consignment Note",

    // Legal / Contracts
    basicContract: "Basic Contract",
};

const MODEL_CATEGORIES: Record<ExtractionModel, string> = {
    // Accounts Payable
    invoice: "Accounts Payable",
    purchaseOrder: "Accounts Payable",
    remittanceAdvice: "Accounts Payable",

    // Expenses
    receipt: "Expenses",
    hotelInvoice: "Expenses",
    taxiReceipt: "Expenses",
    utilityBill: "Expenses",

    // Tax & HR
    usForm1040: "Tax & HR",
    usFormW2: "Tax & HR",

    // Finance
    personalEarningsStatement: "Finance",
    bankStatement: "Finance",
    brokerageStatement: "Finance",

    // Logistics / Shipping
    deliveryNote: "Logistics",
    airWaybill: "Logistics",
    arrivalNotice: "Logistics",
    billOfLading: "Logistics",
    certificateOfOrigin: "Logistics",
    commercialInvoice: "Logistics",
    dangerousGoodsDeclaration: "Logistics",
    customsDeclaration: "Logistics",
    packingList: "Logistics",
    seaWaybill: "Logistics",
    internationalConsignmentNote: "Logistics",

    // Legal / Contracts
    basicContract: "Legal",
};

const MODEL_OPTIONS: ModelOption[] = (Object.keys(MODEL_LABELS) as ExtractionModel[]).map<ModelOption>((model) => ({
    model,
    label: MODEL_LABELS[model],
    category: MODEL_CATEGORIES[model],
}));

const grouped = MODEL_OPTIONS.reduce<Record<string, ModelOption[]>>((acc, opt) => {
    (acc[opt.category] ||= []).push(opt);
    return acc;
}, {});

export default function Extractor() {
    const { file, base64, doc, onFileChange } = useFileReader();
    const [result, setResult] = useState<string>(JSON.stringify({ data: "will", appear: { excactly: "here" } }, null, 4));
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState<ExtractionModel>("invoice");

    const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setModel(e.target.value as ExtractionModel);
    };

    const handleConfirm = async () => {
        if (!base64 || !file) return;
        setLoading(true);
        setResult("");

        try {
            const { data, error } = await actions.extractDocument({
                base64EncodedContent: base64,
                fileName: file.name,
                model,
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
                <select className="select select-bordered w-full" defaultValue={MODEL_OPTIONS[0].model} onChange={handleModelChange}>
                    {Object.entries(grouped).map(([cat, opts]) => (
                        <optgroup key={cat} label={cat}>
                            {opts.map((opt) => (
                                <option key={opt.model} value={opt.model}>
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

            <textarea
                className="textarea textarea-bordered w-full h-64 font-mono"
                placeholder="API output will appear here…"
                value={result}
                readOnly
            />
        </div>
    );
}
