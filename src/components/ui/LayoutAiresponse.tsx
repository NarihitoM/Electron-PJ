import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import "katex/dist/katex.min.css";
import { useCallback, useMemo, useState, memo } from 'react';
import React from 'react';
import { Check, Copy } from 'lucide-react';

//Codeblock
const CodeBlock = React.memo(({ language, value }: any) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = useCallback(async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [value]);

    return (
        <div className="relative group w-full my-4">
            <div className="flex items-center justify-between px-4 py-2 bg-cyan-200 dark:bg-zinc-800 rounded-t-xl">
                <span className="text-xs font-mono dark:text-white text-muted-foreground">
                    {language}
                </span>
                <button onClick={copyToClipboard} className="p-1.5 rounded-md  " >
                    {
                        copied ?
                            <Check className="h-4 w-4 text-green-700" /> : <Copy className="h-4 w-4 dark:text-white text-muted-foreground" />
                    }
                </button>
            </div>
            <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                wrapLongLines={true}
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.875rem', lineHeight: '1.5', width: '100%', borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem', }}
                codeTagProps={{ style: { fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }} >
                {value}
            </SyntaxHighlighter>
        </div>
    );
});

//processContent
const processContent = (text: string) =>
    text
        .replace(/(Appended data to: [^\s]+|Updated \d+ cells[^\s]+)/g, "$1\n\n")
        .replace(/^\[\[[\s\S]*?\]\]/, "")
        .replace(/([^\n])\n\|/g, "$1\n\n|")
        .replace(/([^\n])\n##/g, "$1\n\n##").replace(/\n([|])/g, "\n\n$1")
        .replace(/\\\[/g, "$$$$")
        .replace(/\\\]/g, "$$$$")
        .replace(/\\\(/g, "$$")
        .replace(/\\\)/g, "$$")
        .replace(/\\\\/g, "\\");


const components = {
    code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "");
        const value = String(children).replace(/\n$/, "");

        return !inline && match ? (
            <CodeBlock language={match[1]} value={value} />
        ) : (
            <code className={className} {...props}>
                {children}
            </code>
        );
    },

    a({ href, children, ...props }: any) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-500 hover:text-cyan-700 underline cursor-pointer transition-transform duration-150 active:translate-y-2"
                {...props}
            >
                {children}
            </a>
        );
    }
}

//Aicoontentinject
const AiContent = ({ content }: { content: string }) => {
    const processedText = useMemo(() => processContent(content), [content]);
    return (
        <div className="markdown-container whitespace-pre-wrap wrap-break-word leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={components}
            >
                {processedText}
            </ReactMarkdown>
        </div>
    );
};

export default memo(AiContent);