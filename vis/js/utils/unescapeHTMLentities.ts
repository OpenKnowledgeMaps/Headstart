export const unescapeHTML = (htmlString: string) => {
    let entityMap: any = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#34;": '"',
        "&#39;": "'",
        "&#x2F;": "/",
        "&#x60;": "`",
        "&#x3D;": "=",
    } as const;

    return String(htmlString).replace(
        /(&amp;|&lt;|&gt;|&quot;|&#34;|&#39;|&#x2F;|&#x60;|&#x3D;)/g,
        function (s) {
            return entityMap[s];
        }
    );
};
