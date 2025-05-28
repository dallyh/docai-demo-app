import ShikiHighlighter from "react-shiki";

type Props = {
    json: string;
};

export default function JsonOutput({ json }: Props) {
    return (
        <div className="w-full" >
            <ShikiHighlighter language="json" theme="github-dark" showLanguage={false} delay={100}>
                {json.trim()}
            </ShikiHighlighter>
        </div>
    );
}
