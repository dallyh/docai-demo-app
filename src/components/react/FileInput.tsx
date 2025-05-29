import type { ChangeEventHandler } from "react";

type FileInputProps = {
	loading: boolean;
	onChange: ChangeEventHandler<HTMLInputElement>;
};
export default function FileInput({ loading, onChange }: FileInputProps) {
	return <input type="file" accept="image/*,.pdf" className="file-input file-input-primary w-full" disabled={loading} onChange={onChange} />;
}
