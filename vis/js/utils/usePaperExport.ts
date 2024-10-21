import { useState, useEffect } from "react";
import { Paper } from "../@types/paper";

export const PAPER_EXPORT_ENDPOINT =
  "services/exportMetadata.php?format=bibtex";

const usePaperExport = (paper: Paper, serverUrl: string) => {
  const [exports, setExports] = useState<any>({});

  useEffect(() => {
    if (!paper || !!exports[paper.safe_id]) {
      return;
    }

    loadPaperExport(paper, serverUrl, setExports);
  }, [setExports, paper, serverUrl]);

  if (!paper || !exports[paper.safe_id]) {
    return null;
  }

  return exports[paper.safe_id];
};

export default usePaperExport;

const loadPaperExport = (paper: Paper, serverUrl: string, callback: (params: any) => void) => {
  fetch(serverUrl + PAPER_EXPORT_ENDPOINT, {
    method: "POST",
    mode: "cors",
    headers: {
      // this is unfortunately necessary because of the download button in templates/modals/ExportPaperModal.jsx
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: "paper=" + encodeURIComponent(JSON.stringify(paper)),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return response.text();
    })
    .then((content) =>
      callback((prev: any) => ({
        ...prev,
        [paper.safe_id]: { error: false, content },
      }))
    )
    .catch((error) => {
      console.error(error);
      callback((prev: any) => ({
        ...prev,
        [paper.safe_id]: { error: true, content: "" },
      }));
    });
};
