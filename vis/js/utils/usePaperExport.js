import { useState, useEffect } from "react";

export const PAPER_EXPORT_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "https://dev.openknowledgemaps.org/export-endpoint/headstart/server/services/exportMetadata?format=bibtex"
    : "https://openknowledgemaps.org/search_api/server/services/exportMetadata?format=bibtex";

const DATA_FALLBACK = "No data available.";

const usePaperExport = (paper) => {
  const [exports, setExports] = useState({});

  useEffect(() => {
    if (!paper || !!exports[paper.safe_id]) {
      return;
    }

    loadPaperExport(paper, setExports);
  }, [setExports, paper]);

  if (!paper || !exports[paper.safe_id]) {
    return "";
  }

  return exports[paper.safe_id];
};

export default usePaperExport;

const loadPaperExport = (paper, callback) => {
  fetch(PAPER_EXPORT_ENDPOINT, {
    method: "POST",
    mode: "cors",
    headers: {
      // this is unfortunately necessary because of the download button in templates/modals/ExportPaperModal.jsx
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: "paper=" + encodeURIComponent(JSON.stringify(paper)),
  })
    .then((response) => response.text())
    .then((data) => callback((prev) => ({ ...prev, [paper.safe_id]: data })))
    .catch((error) => {
      console.error(error);
      callback((prev) => ({
        ...prev,
        [paper.safe_id]: DATA_FALLBACK,
      }));
    });
};
