// @ts-nocheck

import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { useLocalizationContext } from "../../../components/LocalizationProvider";

const ResearcherMetricsInfo = ({
  params
}) => {
  const localization = useLocalizationContext();

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
            {params.normalized_h_index ? params.normalized_h_index?.toFixed(1) : localization.notAvailable}
          </span>
        </p>
        <p>
          Academic age: <span>
            {params.academic_age ? params.academic_age : localization.notAvailable}
          </span>
        </p>
        {params.show_h_index ? (
          <p>
            h-index: <span>
              {params.h_index ? params.h_index : localization.notAvailable}
            </span>
          </p>
        ) : null}
        <p>
          Number of total citations: <span>{params.total_citations ? params.total_citations : localization.notAvailable}</span>
        </p>
        <h3>ALTMETRICS</h3>
        <p>
          Number of total unique social media mentions:{" "}
          <span>{params.total_unique_social_media_mentions ? params.total_unique_social_media_mentions : localization.notAvailable}</span>
        </p>
        <p>
          Number of total news encyclopaedia, patent and policy references:{" "}
          <span>{params.total_neppr ? params.total_neppr : localization.notAvailable}</span>
        </p>
        <h3>NOTES ON METRICS</h3>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Neque dolorum laudantium cupiditate ratione dignissimos rem nesciunt numquam cumque aliquid quis, incidunt impedit dolore amet nemo odio dolores atque. Deserunt fugit quibusdam nemo mollitia nobis id quos deleniti eaque velit dignissimos!
        </p>
        <p>
          {params.external_identifiers.map((external_id) => (
            <p key={external_id["value"]}>
              <a className="underline" href={external_id["url"]} target="_blank" rel="noopener noreferrer">
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
      show_h_index: state.contextLine.showHIndex,
      h_index: state.author.h_index,
      academic_age: state.author.academic_age,
      normalized_h_index: state.author.normalized_h_index,
    },
  };
};

export default connect(mapStateToProps)(ResearcherMetricsInfo);
