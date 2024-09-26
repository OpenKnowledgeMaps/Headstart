import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";

const noDataAvailable = "No data available";

const FundingSection = ({ funds, showMore, handleShowMore }) => {
  const formatFunding = (fund) => {
    const endDate = fund.end_date ? fund.end_date : "present";

    return (
      <div key={fund.id}>
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
        <p>
          {[
            `${fund.start_date} - ${endDate}`,
            fund.type,
            fund.organization && `Funder: ${fund.organization}`,
            fund.amount?.value && fund.amount?.currency && `Amount: ${fund.amount.value} ${fund.amount.currency}`
          ]
            .filter(Boolean)
            .join(" / ")}
        </p>
      </div>
    );
  };

  return (
    <div>
      <h3>FUNDING {funds?.length ? `(${funds.length})` : ""}</h3>
      {funds?.length ? (
        <>
          {formatFunding(funds[0])}
          {funds.length > 1 && (
            <>
              {showMore && funds.slice(1).map(formatFunding)}
              <button onClick={handleShowMore}>
                <i className={`fas fa-${showMore ? "chevron-up" : "chevron-down"}`}></i>
                {showMore ? "Show Less" : "Show More"}
              </button>
            </>
          )}
        </>
      ) : (
        <p>{noDataAvailable}</p>
      )}
    </div>
  );
};

const Section = ({ title, items, formatItem, showMore, handleShowMore }) => {
  return (
    <div>
      <h3>{title} {items?.length ? `(${items.length})` : ""}</h3>
      {items?.length ? (
        <>
          {formatItem(items[0])}
          {items.length > 1 && (
            <>
              {showMore && items.slice(1).map(formatItem)}
              <button onClick={handleShowMore}>
                <i className={`fas fa-${showMore ? "chevron-up" : "chevron-down"}`}></i>
                {showMore ? "Show Less" : "Show More"}
              </button>
            </>
          )}
        </>
      ) : (
        <p>{noDataAvailable}</p>
      )}
    </div>
  );
};

const formatEmployment = (employment) => {
  const endDate = employment.end_date ? employment.end_date : "present";
  return (
    <p key={employment.id}>
      {[
        `${employment.start_date} - ${endDate}`,
        employment.role,
        employment.organization,
        employment.organization_address
      ].filter(Boolean).join(" / ")}
    </p>
  );
};

const formatEducation = (education) => {
  const endDate = education.end_date ? education.end_date : "present";
  return (
    <p key={education.id}>
      {[
        `${education.start_date} - ${endDate}`,
        education.role,
        education.organization,
        education.organization_address
      ].filter(Boolean).join(" / ")}
    </p>
  );
};

const formatDistinction = (distinction) => {
  return (
    <p key={distinction.id}>
      {[
        distinction.start_date,
        distinction.title
      ].filter(Boolean).join(" / ")}
    </p>
  );
};

const formatLink = (link) => (
  <p key={link.value}>
    <i className="fas fa-solid fa-link" style={{ paddingRight: "3px" }}></i>
    <a href={link.url} target="_blank" rel="noopener noreferrer">
      {link.type}: {link.value}
    </a>
  </p>
);

const ResearcherInfo = ({ params }) => {
  const [showMore, setShowMore] = useState({
    employments: false,
    educations: false,
    funds: false,
    distinctions: false,
    links: false,
  });

  const handleShowMore = (section) => {
    setShowMore((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">Researcher details</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        <Section
          title="EMPLOYMENT"
          items={params.employments}
          formatItem={formatEmployment}
          showMore={showMore.employments}
          handleShowMore={() => handleShowMore("employments")}
        />
        <Section
          title="EDUCATION & QUALIFICATIONS"
          items={params.educations}
          formatItem={formatEducation}
          showMore={showMore.educations}
          handleShowMore={() => handleShowMore("educations")}
        />
        <FundingSection
          funds={params.funds}
          showMore={showMore.funds}
          handleShowMore={() => handleShowMore("funds")}
        />
        <Section
          title="LINKS"
          items={params.external_identifiers}
          formatItem={formatLink}
          showMore={showMore.links}
          handleShowMore={() => handleShowMore("links")}
        />
        <Section
          title="DISTINCTIONS / AWARDS"
          items={params.distinctions}
          formatItem={formatDistinction}
          showMore={showMore.distinctions}
          handleShowMore={() => handleShowMore("distinctions")}
        />
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