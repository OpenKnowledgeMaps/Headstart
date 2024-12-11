// @ts-nocheck

import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { useLocalizationContext } from "../../../components/LocalizationProvider";

const NotesOnMetrics = (props) => {
  return (
    <p>
      <strong className="hs-strong">Notes on metrics:</strong>{' '}
      {props.notes}
    </p>
  )
}

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
        <h3>TRADITIONAL METRICS</h3>
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
        <NotesOnMetrics notes={'Metrics are based on citation data provided by Crossref and information supplied by the researcher on their ORCID profile. Results may be impacted by accuracy and completeness of this data.'} />

        <h3>ALTMETRICS</h3>
        <p>
          Number of total unique social media mentions:{" "}
          <span>{params.total_unique_social_media_mentions ? params.total_unique_social_media_mentions : localization.notAvailable}</span>
        </p>
        <p>
          Number of total news encyclopaedia, patent and policy references:{" "}
          <span>{params.total_neppr ? params.total_neppr : localization.notAvailable}</span>
        </p>
        <NotesOnMetrics notes={'Metrics are based on data provided by Altmetric and information supplied by the researcher on their ORCID profile. Results may be impacted by accuracy and completeness of this data. Social media mentions include the following: Facebook, blog posts, Google+, Reddit, X, Youtube, Q&A forums and Stack Exchange.'} />

        {params.enable_teaching_mentorship ? (
          <>
            <h3>TEACHING & MENTORSHIP</h3>
            <p>
              Number of total supervised PHD students:{" "}
              <span>{params.total_supervised_phd_students ? params.total_supervised_phd_students : localization.notAvailable}</span>
            </p>
            <p>
              Number of total supervised master students:{" "}
              <span>{params.total_supervised_master_students ? params.total_supervised_master_students : localization.notAvailable}</span>
            </p>
            <p>
              Number of total supervised bachelor students:{" "}
              <span>{params.total_supervised_bachelor_students ? params.total_supervised_bachelor_students : localization.notAvailable}</span>
            </p>
            <NotesOnMetrics notes={'Metrics are based on information supplied by the researcher on their ORCID profile. Entries titled “Supervision” and “Co-supervision” are counted for each degree. Results may be impacted by accuracy and completeness of this data.'} />
          </>
        ) : null}
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
      show_h_index: state.contextLine.show_h_index,
      h_index: state.author.h_index,
      academic_age: state.author.academic_age,
      normalized_h_index: state.author.normalized_h_index,
      total_supervised_bachelor_students: state.author.total_supervised_bachelor_students,
      total_supervised_master_students: state.author.total_supervised_master_students,
      total_supervised_phd_students: state.author.total_supervised_phd_students,
      enable_teaching_mentorship: state.author.enable_teaching_mentorship,
    },
  };
};

export default connect(mapStateToProps)(ResearcherMetricsInfo);
