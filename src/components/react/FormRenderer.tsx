import { useEffect, useState, type ChangeEvent, type JSX } from "react";

export function FormRenderer({ json }: { json: string | undefined }) {
	const [showForm, setShowForm] = useState(false);
	const [data, setData] = useState<object | null>(null);
	const [rendered, setRendered] = useState(false);
	const [form, setForm] = useState<JSX.Element[] | null>(null);

	useEffect(() => {
		if (json) {
			setData(JSON.parse(json));
		}
	}, [json]);

	const onShowFormCallback = (e: ChangeEvent<HTMLInputElement>) => {
		setShowForm(e.target.checked);

		if (e.target.checked && data) {
			render(data);
		}
	};

	const humanizeKey = (key: string) => {
		const withSpaces = key.replace(/([A-Z])/g, " $1");

		if (!withSpaces) {
			return key;
		}

		return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
	};

	const render = (obj: object, prefix = "") => {
		const form = renderFields(obj, prefix);
		setForm(form);
		setRendered(true);
	};

	const renderFields = (obj: object, prefix = "") =>
		Object.entries(obj).map(([key, val]) => {
			const name = prefix ? `${prefix}.${key}` : key;

			if (Array.isArray(val)) {
				const isPrimitiveArray = val.every((item) => item === null || typeof item !== "object");

				return (
					<fieldset key={name} className="fieldset bg-base-200 border-primary/50 rounded-box w-full border p-4">
						<legend className="fieldset-legend">
							{humanizeKey(key)} ({key}) (array)
						</legend>

						{isPrimitiveArray
							? // render primitives directly
								val.map((item, i) => (
									<fieldset key={`${name}[${i}]`} className="fieldset bg-base-100 border-primary/50 rounded-box w-full border p-4">
										<legend className="fieldset-legend">
											Item #{i + 1} ({key})
										</legend>
										<input readOnly id={`${name}[${i}]`} name={`${name}[${i}]`} defaultValue={item as any} type={typeof item === "number" ? "number" : "text"} className="input w-full" />
									</fieldset>
								))
							: // recurse for objects/arrays
								val.map((item, i) => (
									<fieldset key={`${name}[${i}]`} className="fieldset bg-base-100 border-primary/50 rounded-box w-full border p-4">
										<legend className="fieldset-legend">
											Item #{i + 1} ({key})
										</legend>
										{renderFields(item as object, `${name}[${i}]`)}
									</fieldset>
								))}
					</fieldset>
				);
			}

			if (val !== null && typeof val === "object") {
				return (
					<fieldset key={name} className="fieldset bg-base-200 border-primary/50 rounded-box w-full border p-4">
						<legend className="fieldset-legend">
							{humanizeKey(key)} ({key})
						</legend>
						{renderFields(val as object, name)}
					</fieldset>
				);
			}

			return (
				<fieldset key={name} className={`fieldset w-full ${prefix === "" ? "bg-base-200 border-primary/50 rounded-box border p-4" : ""}`}>
					<label htmlFor={name} className="label">
						{humanizeKey(key)} ({key})
					</label>
					<input readOnly id={name} name={name} defaultValue={val as any} type={typeof val === "number" ? "number" : "text"} className="input w-full" />
				</fieldset>
			);
		});

	return (
		<div className="flex flex-col gap-4">
			<label className="label">
				<input type="checkbox" className="toggle toggle-primary" onChange={onShowFormCallback} />
				Show form
			</label>
			{showForm && !rendered && (
				<div className="self-center">
					<span className="loading loading-spinner loading-md"></span> Rendering...
				</div>
			)}
			{showForm && rendered && <form className="flex w-full flex-col gap-2">{form}</form>}
		</div>
	);
}
