// @ts-nocheck
import React from "react";
import { Modal } from "react-bootstrap";

import AboutSoftware from "./subcomponents/AboutSoftware";
import DataSource from "./subcomponents/DataSource";
import { queryConcatenator } from "../../../utils/data";
import { unescapeHTML } from "../../../utils/unescapeHTMLentities";

const OrcidInfo = ({
  serviceName,
  serviceDesc,
  serviceLogo,
  params: { author, query, customTitle, sorting, repo_name, q_advanced, custom_clustering },
}) => {
  let queryString = queryConcatenator([query, q_advanced])

  customTitle = customTitle && unescapeHTML(customTitle)
  custom_clustering = custom_clustering && unescapeHTML(custom_clustering)

  return (
    // html template starts here
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">ABOUT THE MAP</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        <p>
          This knowledge map presents you with a topical overview of the most recent works of <strong className="hs-strong">{author?.author_name || ''} ({queryString})</strong>.
        </p>

        <p>
          The knowledge map provides an instant overview of a researcher's works showing their
          main areas of interest at a glance, and documents related to them. This makes it possible
          to easily identify useful, pertinent information.
        </p>
        <p>
          We use text similarity to create a knowledge map. The algorithm groups those documents
          together that have many words in common. Area titles are created from subject keywords
          of documents that have been assigned to the same area. We select those keywords and phrases
          that appear frequently in one area, and seldom in other areas.
        </p>
        <h3>Data source</h3>

        <p>
          We use multiple data sources to generate the content.
          For the knowledge map and the researcher details we use <a
            target="_blank"
            rel="noreferrer"
            href="https://orcid.org/"
          >
            ORCID
          </a> as our main data source.
          To improve knowledge map quality we enrich the metadata of works that have a DOI, e.g. we
          add keywords, open access information and abstracts from <a
            target="_blank"
            rel="noreferrer"
            href="http://base-search.net"
          >
            BASE
          </a>.
        </p>

        <p>
          Metrics are based on data provided by <a
            target="_blank"
            rel="noreferrer"
            href="https://www.crossref.org/"
          >
            Crossref
          </a>, <a
            target="_blank"
            rel="noreferrer"
            href="https://www.altmetric.com/"
          >
            Altmetric
          </a>, and
          the information supplied by the researcher on their ORCID profile.
          Results may be impacted by accuracy and completeness of this data.
          Please note that the data provided by Altmetric ("social media 
          mentions" and "references outside of academia") are protected by 
          copyright and other proprietary rights, as outlined in their <a
            target="_blank"
            rel="noreferrer"
            href="https://www.altmetric.com/terms-of-use/"
          >
            Terms of Use
          </a>.
        </p>

        <AboutSoftware />
      </Modal.Body>
    </>
    // html template ends here
  );
};

export default OrcidInfo;
