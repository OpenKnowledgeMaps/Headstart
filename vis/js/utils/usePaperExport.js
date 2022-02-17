import { useState, useEffect } from "react";

export const PAPER_EXPORT_ENDPOINT =
  "services/exportMetadata.php?format=bibtex";

const DATA_FALLBACK = "No data available.";

const usePaperExport = (paper, serverUrl) => {
  const [exports, setExports] = useState({});

  useEffect(() => {
    if (!paper || !!exports[paper.safe_id]) {
      return;
    }

    loadPaperExport(paper, serverUrl, setExports);
  }, [setExports, paper, serverUrl]);

  if (!paper || !exports[paper.safe_id]) {
    return "";
  }

  return exports[paper.safe_id];
};

export default usePaperExport;

const loadPaperExport = (paper, serverUrl, callback) => {
  fetch(serverUrl + PAPER_EXPORT_ENDPOINT, {
    method: "POST",
    mode: "cors",
    headers: {
      // this is unfortunately necessary because of the download button in templates/modals/ExportPaperModal.jsx
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: "paper=" + encodeURIComponent(JSON.stringify(paper)),
  })
    .then((response) => response.text())
    .then((data) =>
      callback((prev) => ({
        ...prev,
        [paper.safe_id]: data ? data : DATA_FALLBACK,
      }))
    )
    .catch((error) => {
      console.error(error);
      callback((prev) => ({
        ...prev,
        [paper.safe_id]: DATA_FALLBACK,
      }));
    });
};