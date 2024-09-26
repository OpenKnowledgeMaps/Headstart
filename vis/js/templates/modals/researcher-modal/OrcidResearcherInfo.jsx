import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";

const ResearcherInfo = ({ params }) => {
  const noDataAvailable = "No data available";
  const [showMore, setShowMore] = useState({
    employments: false,
    educations: false,
    funds: false,
    distinctions: false,
  });

  const handleShowMore = (section) => {
    setShowMore({ ...showMore, [section]: !showMore[section] });
  };

  const formatEmployment = (employment) => {
    const endDate = employment.end_date ? employment.end_date : "present";
    return [
      `${employment.start_date} - ${endDate}`,
      employment.role,
      employment.organization,
      employment.organization_address // Only displays if it exists.
    ]
      .filter(Boolean)
      .join(" / ");
  };

  const formatFunding = (fund) => {
    const endDate = fund.end_date ? fund.end_date : "present";

    return (
      <>
        {/* Title with link or plain text */}
        <p>
          {fund.url ? (
            <a href={fund.url} target="_blank" rel="noopener noreferrer">
              <i className="fas fa-solid fa-link" style={{ paddingRight: "3px" }}></i>
              {fund.title}
            </a>
          ) : (
            fund.title
          )}
        </p>

        {/* Funding metadata */}
        <p>
          {[
            `${fund.start_date} - ${endDate}`, // Start and end dates
            fund.type, // Type of funding
            fund.organization ? `Funder: ${fund.organization}` : null, // Funder (if available)
            fund.amount?.value && fund.amount?.currency ? `Amount: ${fund.amount.value} ${fund.amount.currency}` : null, // Amount (if available)
          ]
            .filter(Boolean)
            .join(" / ")}
        </p>
      </>
    );
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">Researcher details</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        {/* Employment Section */}
        <h3>
          EMPLOYMENT{" "}
          {params.employments?.length ? `(${params.employments.length})` : ""}
        </h3>
        {params.employments?.length ? (
          <>
            <p>{formatEmployment(params.employments[0])}</p>
            {params.employments.length > 1 && (
              <>
                {showMore.employments && params.employments.slice(1).map((employment) => (
                  <p key={employment.id}>{formatEmployment(employment)}</p>
                ))}
                <button onClick={() => handleShowMore("employments")}>
                  <i className={`fas fa-${showMore.employments ? "chevron-up" : "chevron-down"}`}></i>
                  {showMore.employments ? "Show Less" : "Show More"}
                </button>
              </>
            )}
          </>
        ) : (
          <p>{noDataAvailable}</p>
        )}

        {/* Education Section */}
        <h3>
          EDUCATION & QUALIFICATIONS{" "}
          {params.educations?.length ? `(${params.educations.length})` : ""}
        </h3>
        {params.educations?.length ? (
          <>
            <p>{[
              `${params.educations[0].start_date} - ${params.educations[0].end_date || "present"}`,
              params.educations[0].role,
              params.educations[0].organization,
              params.educations[0].organization_address
            ]
              .filter(Boolean)
              .join(" / ")}</p>
            {params.educations.length > 1 && (
              <>
                {showMore.educations && params.educations.slice(1).map((education) => (
                  <p key={education.id}>{[
                    `${education.start_date} - ${education.end_date || "present"}`,
                    education.role,
                    education.organization,
                    education.organization_address
                  ].filter(Boolean).join(" / ")}</p>
                ))}
                <button onClick={() => handleShowMore("educations")}>
                  <i className={`fas fa-${showMore.educations ? "chevron-up" : "chevron-down"}`}></i>
                  {showMore.educations ? "Show Less" : "Show More"}
                </button>
              </>
            )}
          </>
        ) : (
          <p>{noDataAvailable}</p>
        )}

        {/* Funding Section */}
        <h3>
          FUNDING {params.funds?.length ? `(${params.funds.length})` : ""}
        </h3>
        {params.funds?.length ? (
          <>
            {formatFunding(params.funds[0])}
            {params.funds.length > 1 && (
              <>
                {showMore.funds && params.funds.slice(1).map((fund) => (
                  <div key={fund.id}>
                    {formatFunding(fund)}
                  </div>
                ))}
                <button onClick={() => handleShowMore("funds")}>
                  <i className={`fas fa-${showMore.funds ? "chevron-up" : "chevron-down"}`}></i>
                  {showMore.funds ? "Show Less" : "Show More"}
                </button>
              </>
            )}
          </>
        ) : (
          <p>{noDataAvailable}</p>
        )}

        {/* Links Section */}
        <h3>
          LINKS {params.external_identifiers?.length ? `(${params.external_identifiers.length})` : ""}
        </h3>
        {params.external_identifiers?.length ? (
          <>
            <i className="fas fa-solid fa-link" style={{ paddingRight: "3px" }}></i>
            <a href={params.external_identifiers[0].url} target="_blank" rel="noopener noreferrer">
              {params.external_identifiers[0].type}: {params.external_identifiers[0].value}
            </a>
          </>
        ) : (
          <p>{noDataAvailable}</p>
        )}

        {/* Distinctions Section */}
        <h3>
          DISTINCTIONS / AWARDS {params.distinctions?.length ? `(${params.distinctions.length})` : ""}
        </h3>
        {params.distinctions?.length ? (
          <>
            <p>{[
              params.distinctions[0].start_date,
              params.distinctions[0].title
            ].filter(Boolean).join(" / ")}</p>
            {params.distinctions.length > 1 && (
              <>
                {showMore.distinctions && params.distinctions.slice(1).map((distinction) => (
                  <p key={distinction.id}>{[
                    distinction.start_date,
                    distinction.title
                  ].filter(Boolean).join(" / ")}</p>
                ))}
                <button onClick={() => handleShowMore("distinctions")}>
                  <i className={`fas fa-${showMore.distinctions ? "chevron-up" : "chevron-down"}`}></i>
                  {showMore.distinctions ? "Show Less" : "Show More"}
                </button>
              </>
            )}
          </>
        ) : (
          <p>{noDataAvailable}</p>
        )}
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