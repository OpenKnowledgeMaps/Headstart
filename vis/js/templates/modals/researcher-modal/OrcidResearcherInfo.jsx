import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";

const DEFAULT_FALLBACK = 'not available';

const ResearcherInfo = ({
  params
}) => {
  return (
    // html template starts here
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">Metrics</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        <h3>METRICS</h3>
        <p>
          Normalised h-index: <span>
            {params.normalized_h_index ? params.normalized_h_index?.toFixed(1) : DEFAULT_FALLBACK}
          </span>
        </p>
        <p>
          Academic age: <span>
            {params.academic_age ? params.academic_age : DEFAULT_FALLBACK}
          </span>
        </p>
        <p>
          h-index: <span>
            {params.h_index ? params.h_index : DEFAULT_FALLBACK}
          </span>
        </p>
        <p>
          Number of total citations: <span>{params.total_citations ? params.total_citations : DEFAULT_FALLBACK}</span>
        </p>
        <h3>ALTMETRICS</h3>
        <p>
          Number of total unique social media mentions:{" "}
          <span>{params.total_unique_social_media_mentions ? params.total_unique_social_media_mentions : DEFAULT_FALLBACK}</span>
        </p>
        <p>
          Number of total news encyclopaedia, patent and policy references:{" "}
          <span>{params.total_neppr ? params.total_neppr : DEFAULT_FALLBACK}</span>
        </p>
        <h3>NOTES ON METRICS</h3>
        <p>{params.biography}</p>
        <h3>OTHER IDs</h3>
        <p>
          {params.external_identifiers.map((external_id) => (
            <p key={external_id["value"]}>
              <a className="underline" href={external_id["url"]}>
                {external_id["type"]}: {external_id["value"]}
              </a>
            </p>
          ))}
        </p>
      </Modal.Body>
    </>
    // html template ends here
  );
};

const mapStateToProps = (state) => {
  return {
    params: {
      total_citations: state.author.total_citations,
      orcid_id: state.author.orcid_id,
      total_unique_social_media_mentions:
        state.author.total_unique_social_media_mentions,
      total_neppr: state.author.total_neppr,
      external_identifiers: state.author.external_identifiers,
      h_index: state.author.h_index,
      academic_age: state.author.academic_age,
      normalized_h_index: state.author.normalized_h_index,
    },
  };
};

export default connect(mapStateToProps)(ResearcherInfo);
