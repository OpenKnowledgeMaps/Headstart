import { useState, useEffect } from "react";
import $ from "jquery";

import { isFileAvailable } from "./data";
import { Paper } from "../@types/paper";
import { useSelector } from "react-redux";

const getVisualizationIdFromStore = (state: any): string => {
  return state.data.options.visualizationId;
};

const getVisualizationTypeFromStore = (state: any): boolean => {
  return state.data.options.isStreamgraph;
};

const usePdfLookup = (paper: Paper, serverUrl: string, service: string) => {
  const [url, setUrl] = useState<string | null>(null);
  const [backupUrl, setBackupUrl] = useState<string | null>(null);

  const visualizationId = useSelector(getVisualizationIdFromStore);
  const isStreamgraph = useSelector(getVisualizationTypeFromStore);

  const resetUrls = () => {
    setUrl(null);
    setBackupUrl(null);
  };

  const handleSuccess = (successUrl: string) => {
    setUrl(successUrl);
    setBackupUrl("");
  };

  const handleError = (errorUrl: string) => {
    setUrl("");
    setBackupUrl(errorUrl);
  };

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
      if (service === "base") {
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

      requestPdfLookup(
        serverUrl,
        articleUrl,
        filename,
        service,
        possiblePDFs,
        visualizationId,
        paper.id,
        isStreamgraph
      )
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
  }, [paper, serverUrl, service, visualizationId, setUrl, setBackupUrl]);

  return [url, backupUrl];
};

export default usePdfLookup;

const ensureThatURLStartsWithHTTP = (url: string): string => {
  let formattedURL = url;

  if (!/^https?:\/\//i.test(url)) {
    formattedURL = "http:" + url;
  }

  return formattedURL;
};

const requestPdfLookup = (
  server: string,
  url: string,
  filename: string,
  service: string,
  pdfURLs: string,
  visualizationId: string,
  paperId: string,
  isStreamgraph: boolean
) => {
  const SCRIPT_PATH_ON_SERVER = "services/getPDF.php";

  const serverURL = ensureThatURLStartsWithHTTP(server);
  const requestURL = new URL(SCRIPT_PATH_ON_SERVER, serverURL);

  const requestParameters = new URLSearchParams({
    url,
    filename,
    service,
    pdf_urls: pdfURLs,
    vis_id: visualizationId,
    paper_id: paperId,
    is_streamgraph: String(isStreamgraph),
  });

  requestURL.search = requestParameters.toString();
  return $.getJSON(requestURL.toString());
};
