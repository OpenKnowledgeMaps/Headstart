import { useState, useEffect } from "react";
import $ from "jquery";

import { isFileAvailable } from "./data";
import { Paper } from "../@types/paper";

const usePdfLookup = (paper: Paper, serverUrl: string, service: string) => {
  const [url, setUrl] = useState<string | null>(null);
  const [backupUrl, setBackupUrl] = useState<string | null>(null);
  
  const resetUrls = () => {
    setUrl(null);
    setBackupUrl(null);
  }
  
  const handleSuccess = (successUrl: string) => {
    setUrl(successUrl);
    setBackupUrl("");
  }
  
  const handleError = (errorUrl: string) => {
    setUrl("");
    setBackupUrl(errorUrl);
  }

  useEffect(() => {
    const loadPDF = () => {
      const filename = `${paper.id.replace(/\/|:/g, "__")}.PDF`;
      const localUrl = `${serverUrl}paper_preview/${filename}`;
      // TODO make this async
      if (isFileAvailable(localUrl)) {
        handleSuccess(localUrl);
        return;
      }

      const articleUrl = encodeURIComponent(paper.oa_link);
      let possiblePDFs = "";
      let fallbackUrl = "";
      if (service === "base" || service === "orcid") {
        possiblePDFs =
          encodeURIComponent(paper.link) +
          ";" +
          encodeURIComponent(paper.identifier) +
          ";" +
          paper.relation
            .split("; ")
            .map((x) => encodeURIComponent(x))
            .join("; ");
      }

      if (service === "openaire") {
        possiblePDFs = encodeURIComponent(paper.link) + ";" + paper.fulltext;
        fallbackUrl = paper.link;
      } else {
        fallbackUrl = paper.outlink;
      }

      requestPdfLookup(serverUrl, articleUrl, filename, service, possiblePDFs)
        .done((data) => {
          if (data.status === "success") {
            handleSuccess(localUrl);
            return;
          }
          if (data.status === "error") {
            handleError(fallbackUrl);
          }
        })
        .fail((d, textStatus, error) => {
          console.error(
            "getJSON failed, status: " + textStatus + ", error: " + error
          );
          handleError(fallbackUrl);
        });
    };

    resetUrls();
    if (paper) {
      loadPDF();
    }
  }, [paper, serverUrl, service, setUrl, setBackupUrl]);

  return [url, backupUrl];
};

export default usePdfLookup;

const requestPdfLookup = (server: string, article: string, file: string, service: string, pdfs: string) => {
  return $.getJSON(
    `${server}services/getPDF.php?url=${article}&filename=${file}&service=${service}&pdf_urls=${pdfs}`
  );
};
