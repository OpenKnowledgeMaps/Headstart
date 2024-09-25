import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";

const DEFAULT_FALLBACK = "not available";

const ResearcherInfo = ({ params }) => {
  const noDataAvailable = "No data available";

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">Researcher details</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        <h3>
          EMPLOYMENT{" "}
          {params.employments?.length ? `(${params.employments?.length})` : nul}
        </h3>

        {!!params.employments?.length ? noDataAvailable : null}
        {params.employments?.map((employment) => (
          <p key={employment.id}>
            {[
              `${employment.start_date} - ${employment.end_date}`,
              employment.role,
              employment.organization,
              // TODO: is it possible somehow split address to city and country? I noticed, that orcid data does not have it
              employment.organization_address,
            ].join(" / ")}
          </p>
        ))}

        <h3>EDUCATION & QUALIFICATION</h3>
        {!!params.educations?.length ? noDataAvailable : null}
        {params.educations?.map((education) => (
          <p key={education.id}>
            {education.role} / {education.start_date} - {education.end_date} /{" "}
            {education.organization} / {education.organization_address}
          </p>
        ))}

        <h3>GRANTS ({params.funds?.length || 0})</h3>
        {!!params.funds?.length ? noDataAvailable : null}
        {params.funds?.map((fund) => (
          <p key={fund.id}>
            {fund.title} / {fund.start_date} - {fund.end_date} / Funder:{" "}
            {fund.organization} / Amount: {fund.amount?.value}{" "}
            {fund.amount?.currency}
          </p>
        ))}

        <h3>LINKS</h3>
        <p>
          {!!params.external_identifiers?.length ? noDataAvailable : null}
          {params.external_identifiers?.map((external_id) => (
            <p key={external_id["value"]}>
              <i
                className="fas fa-solid fa-link"
                style={{ paddingRight: "3px" }}
              ></i>
              <a className="underline" href={external_id["url"]}>
                {external_id["type"]}: {external_id["value"]}
              </a>
            </p>
          ))}
        </p>

        <h3>DISTINCTIONS / AWARDS ({params.distinctions?.length || 0})</h3>
        {!!params.distinctions?.length ? noDataAvailable : null}
        {params.distinctions?.map((distinction) => (
          <p key={distinction.id}>
            {distinction.title} / {distinction.start_date} -{" "}
            {distinction.end_date} / {distinction.organization} /{" "}
            {distinction.organization_address}
          </p>
        ))}

        <h3>MEMBERSHIPS ({params.memberships?.length || 0})</h3>
        {!!params.memberships?.length ? noDataAvailable : null}
        {params.memberships?.map((membership) => (
          <p key={membership.id}>
            {membership.role} / {membership.start_date} - {membership.end_date}{" "}
            / {membership.organization} / {membership.organization_address}
          </p>
        ))}

        <h3>PEER REVIEWS ({params.peer_reviews?.length || 0})</h3>
        {!!params.peer_reviews?.length ? noDataAvailable : null}
        {params.peer_reviews?.map((peer_review) => (
          <p key={peer_review.id}>
            {peer_review.role} / {peer_review.completion_date} /{" "}
            {peer_review.organization} / {peer_review.organization_address}
          </p>
        ))}
      </Modal.Body>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    params: {
      orcid_id: state.author.orcid_id,
      external_identifiers: state.author.external_identifiers,
      funds: state.author.funds,
      educations: state.author.educations,
      employments: state.author.employments,
      memberships: state.author.memberships,
      distinctions: state.author.distinctions,
    },
  };
};

export default connect(mapStateToProps)(ResearcherInfo);
