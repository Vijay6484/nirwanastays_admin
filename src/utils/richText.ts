export function isRichTextEmpty(html: string | null | undefined): boolean {
    if (!html) return true;
    const text = html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\u200B/g, "")
        .replace(/\s+/g, " ")
        .trim();
    return text.length === 0;
}

export function stripEditorArtifacts(html: string): string {
    if (!html) return "";
    return html.replace(
        /<span[^>]*class=["']?ql-cursor["']?[^>]*>.*?<\/span>/gi,
        "",
    );
}
