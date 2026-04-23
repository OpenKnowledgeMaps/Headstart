// @ts-nocheck
import React from "react";
import { Modal } from "react-bootstrap";

import { unescapeHTML } from "@/js/utils/unescapeHTMLentities";

import { queryConcatenator } from "../../../../utils/data";
import AboutSoftware from "./AboutSoftware";
import DataSource from "./DataSource";

const StandardSGInfo = ({
  serviceName,
  serviceDesc,
  serviceLogo,
  params: { query, customTitle, sorting, repo_name, q_advanced },
}) => {
  const queryAfterConcatenate = queryConcatenator([query, q_advanced]);
  const saveCustomTitle = customTitle && unescapeHTML(customTitle);

  const hasQuery = queryAfterConcatenate.length > 0;
  const hasCustomTitle = Boolean(saveCustomTitle);

  return (
    // html template starts here
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">What's this?</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        <p>
          This streamgraph presents you with an overview of the main keywords{" "}
          {(!!customTitle || !!query || !!q_advanced) && (
            <>
              related to{" "}
              <strong className="hs-strong">
                {customTitle ? customTitle : queryAfterConcatenate}
              </strong>
            </>
          )}{" "}
          over time. It is based on the{" "}
          {sorting === "most-relevant" ? (
            <a
              target="_blank"
              rel="noreferrer"
              href="https://openknowledgemaps.org/faq#faq-most-relevant"
            >
              most relevant
            </a>
          ) : (
            "most recent"
          )}{" "}
          resources related to the main keywords. Up to 1000 resources have been
          taken into consideration for the computation of the streamgraph.
        </p>
        <p>
          The height of a stream represents the number of resources with this
          keyword at a specific time. It is important to note that the number of
          resources matches the relative height, not the absolute height of the
          stream.
        </p>

        {hasQuery && hasCustomTitle && (
          <p>
            This visualization has a custom title and was created using the
            following query: <strong className="hs-strong">{query}</strong>
          </p>
        )}

        <p>
          Streamgraphs are particularly useful for investigating the evolution
          of keywords over time and to analyse trends in research.
        </p>
        <p>
          Please{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://openknowledgemaps.org/faqs_streamgraph"
          >
            read our FAQs
          </a>{" "}
          to find out more about streamgraphs.
        </p>
        {!!serviceName && (
          <DataSource
            source={serviceName}
            contentProvider={repo_name}
            description={serviceDesc}
            logo={serviceLogo}
          />
        )}
        <AboutSoftware />
      </Modal.Body>
    </>
    // html template ends here
  );
};

export default StandardSGInfo;
