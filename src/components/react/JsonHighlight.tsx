import { useEffect, useState } from "react";
import "../../styles/json.css";

function syntaxHighlight(json: string | null) {
	if (!json) return ""; //no JSON from response

	json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = "number";
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = "key";
			} else {
				cls = "string";
			}
		} else if (/true|false/.test(match)) {
			cls = "boolean";
		} else if (/null/.test(match)) {
			cls = "null";
		}
		return '<span class="' + cls + '">' + match + "</span>";
	});
}

export default function JsonHighlight({ jsonData }: { jsonData: string }) {
	const [json, setJson] = useState<string | null>(null);

	useEffect(() => {
		setJson(jsonData);
	}, [jsonData]);

	const handleCopy = () => {
		if (json) {
			navigator.clipboard.writeText(json);
			window.alert("Copied to clipboard.");
			return;
		}

		window.alert("Nothing to copy");
	};

	return (
		<div className="mockup-code bg-base-300 relative h-72 w-full font-mono">
			{json && (
				<div className="tooltip tooltip-left tooltip-primary absolute top-4 right-4 m-2" data-tip="Copy to clipboard">
					<button className="btn btn-square btn-sm btn-primary" aria-label="Copy to clipboard" title="Copy to clipboard" onClick={handleCopy}>
						<svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
							<path d="M 16 3 C 14.742188 3 13.847656 3.890625 13.40625 5 L 6 5 L 6 28 L 26 28 L 26 5 L 18.59375 5 C 18.152344 3.890625 17.257813 3 16 3 Z M 16 5 C 16.554688 5 17 5.445313 17 6 L 17 7 L 20 7 L 20 9 L 12 9 L 12 7 L 15 7 L 15 6 C 15 5.445313 15.445313 5 16 5 Z M 8 7 L 10 7 L 10 11 L 22 11 L 22 7 L 24 7 L 24 26 L 8 26 Z"></path>
						</svg>
					</button>
				</div>
			)}

			{json && (
				<pre
					dangerouslySetInnerHTML={{
						__html: syntaxHighlight(json),
					}}
					className="h-60 overflow-auto p-4"
				/>
			)}

			{!json && (
				<div className="flex w-full justify-center">
					<div className="badge badge-primary badge-soft">Output is empty.</div>
				</div>
			)}
		</div>
	);
}
