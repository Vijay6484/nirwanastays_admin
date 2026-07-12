import { useEffect, useMemo, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

const Font = Quill.import("attributors/style/font") as {
    whitelist: string[];
};
Font.whitelist = [
    "arial",
    "comic-sans",
    "courier-new",
    "georgia",
    "helvetica",
    "impact",
    "lucida",
    "times-new-roman",
    "trebuchet",
    "verdana",
    "sans-serif",
    "serif",
    "monospace",
];
Quill.register(Font, true);

const Size = Quill.import("attributors/style/size") as {
    whitelist: string[];
};
Size.whitelist = [
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "28px",
    "32px",
    "36px",
];
Quill.register(Size, true);

export const QUILL_FORMATS = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "link",
    "script",
    "code-block",
];

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ font: Font.whitelist }],
        [{ size: Size.whitelist }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "link"],
        ["clean"],
    ],
    clipboard: {
        matchVisual: false,
    },
};

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
    className = "",
    minHeight = "180px",
}: RichTextEditorProps) {
    const quillRef = useRef<ReactQuill>(null);
    const modules = useMemo(() => QUILL_MODULES, []);

    useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const handlePaste = (event: ClipboardEvent) => {
            const clipboard = event.clipboardData;
            if (!clipboard) return;

            const html = clipboard.getData("text/html")?.trim();
            if (!html) return;

            event.preventDefault();
            event.stopPropagation();

            const range = quill.getSelection(true);
            const index = range ? range.index : quill.getLength();
            quill.clipboard.dangerouslyPasteHTML(index, html, "user");
        };

        quill.root.addEventListener("paste", handlePaste, true);
        return () => {
            quill.root.removeEventListener("paste", handlePaste, true);
        };
    }, []);

    return (
        <div className={`rich-text-editor ${className}`} style={{ minHeight }}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={QUILL_FORMATS}
                placeholder={placeholder}
            />
        </div>
    );
}
