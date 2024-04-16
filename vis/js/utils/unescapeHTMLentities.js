export const unescapeHTML = (string) => {
    let entityMap = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#34;": '"',
        "&#39;": "'",
        "&#x2F;": "/",
        "&#x60;": "`",
        "&#x3D;": "=",
    };

    return String(string).replace(
        /(&amp;|&lt;|&gt;|&quot;|&#34;|&#39;|&#x2F;|&#x60;|&#x3D;)/g,
        function (s) {
            return entityMap[s];
        }
    );
};
