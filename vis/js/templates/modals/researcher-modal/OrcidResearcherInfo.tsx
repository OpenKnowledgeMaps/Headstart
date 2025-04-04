// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { useLocalizationContext } from "../../../components/LocalizationProvider";
import { capitalize } from "../../../utils/string";

const FundingSection = ({ funds, showMore, handleShowMore }) => {
  const localization = useLocalizationContext();

  const formatFunding = (fund) => {
    const startDate = fund.start_date;
    const endDate = fund.end_date ? fund.end_date : "present";
    const dateRange =
      startDate && startDate === endDate
        ? endDate
        : startDate
        ? `${startDate} - ${endDate}`
        : endDate;
  
    return (
      <p key={fund.id}>
        <div>
          {fund.url ? (
            <a href={fund.url} target="_blank" rel="noopener noreferrer">
              <i className="fas fa-solid fa-link" style={{ paddingRight: "3px" }}></i>
              {fund.title}
            </a>
          ) : (
            fund.title
          )}
        </div>
        <div>
          {[
            dateRange,
            fund.type ? capitalize(fund.type) : null,
            fund.organization && `Funder: ${fund.organization}`,
            fund.amount?.value && fund.amount?.currency && `Amount: ${fund.amount.value} ${fund.amount.currency}`
          ]
            .filter(Boolean)
            .join(" / ")}
        </div>
      </p>
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
              <button className="underlined_button" onClick={handleShowMore}>
                <i className={`fas fa-${showMore ? "chevron-up" : "chevron-down"}`} style={{
                  paddingRight: "3px"
                }}></i>
                {showMore ? localization.showLess : localization.showMore}
              </button>
            </>
          )}
        </>
      ) : (
        <p>{localization.noDataAvailable}</p>
      )}
    </div>
  );
};

const Section = ({ title, subtitle, items, formatItem, showMore, handleShowMore }) => {
  const localization = useLocalizationContext();

  const itemsLength = items?.length ? `(${items?.length})` : ""

  return (
    <div>
      <h3>{title} {!subtitle && itemsLength ? itemsLength : ""}</h3>
      {subtitle ? <h4 style={{
        fontWeight: '700',
        marginTop: '0',
        fontSize: '14px',
        textTransform: 'none',
      }}>{subtitle} {itemsLength ? itemsLength : ""}</h4> : null}
      {items?.length ? (
        <>
          {formatItem(items[0])}
          {items.length > 1 && (
            <>
              {showMore && items.slice(1).map(formatItem)}
              <button className="underlined_button" onClick={handleShowMore}>
                <i className={`fas fa-${showMore ? "chevron-up" : "chevron-down"}`} style={{
                  paddingRight: "3px"
                }}></i>
                {showMore ? "Show Less" : "Show More"}
              </button>
            </>
          )}
        </>
      ) : (
        <p>{localization.noDataAvailable}</p>
      )}
    </div>
  );
};


const TextSection = ({ title, content }) => {
  const localization = useLocalizationContext();
  const containerRef = useRef(null);

  const [showFullText, setShowFullText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const handleToggleShowMore = () => {
    setShowFullText((prev) => !prev);
  };

  /**
   * Checks if content does NOT fit in a single line by comparing scrollWidth vs clientWidth.
   */
  const checkSingleLineOverflow = () => {
    const container = containerRef.current;
    if (!container) return;

    // Store the current whiteSpace so we can restore it later
    const previousWhiteSpace = container.style.whiteSpace;

    // Force single line for measuring
    container.style.whiteSpace = "nowrap";

    // If the text is overflowing horizontally, then it doesn't fit in one line
    const isOverflowing = container.scrollWidth > container.clientWidth;

    // Restore the original style
    container.style.whiteSpace = previousWhiteSpace;

    setShowButton(isOverflowing);
  };

  useEffect(() => {
    // Check immediately (on mount) and also whenever content changes
    checkSingleLineOverflow();

    // Re-check on window resize
    window.addEventListener("resize", checkSingleLineOverflow);
    return () => window.removeEventListener("resize", checkSingleLineOverflow);
  }, [content]);

  return (
    <div>
      <h3>{title}</h3>
      <p
        ref={containerRef}
        style={{
          whiteSpace: showFullText ? "pre-wrap" : "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {content || localization.noDataAvailable}
      </p>

      {showButton && (
        <button className="underlined_button" onClick={handleToggleShowMore}>
          <i
            className={`fas fa-${showFullText ? "chevron-up" : "chevron-down"}`}
            style={{ paddingRight: "3px" }}
          ></i>
          {showFullText ? localization.showLess : localization.showMore}
        </button>
      )}
    </div>
  );
};

const formatBiography = (biography) => {
  return (
    <p key={biography}>
      {biography}
    </p>
  );
};

const formatEmployment = (employment) => {
  const startDate = employment.start_date;
  const endDate = employment.end_date ? employment.end_date : "present";
  const dateRange =
    startDate && startDate === endDate
      ? endDate
      : startDate
      ? `${startDate} - ${endDate}`
      : endDate === 'present' ? undefined : endDate;

  return (
    <p key={employment.id}>
      {[
        dateRange,
        employment.role,
        employment.organization,
        employment.organization_address
      ].filter(Boolean).join(" / ")}
    </p>
  );
};

const formatService = (service) => {
  const startDate = service.start_date;
  const endDate = service.end_date ? service.end_date : "present";
  const dateRange =
    startDate && startDate === endDate
      ? endDate
      : startDate
      ? `${startDate} - ${endDate}`
      : endDate === 'present' ? undefined : endDate;

  return (
    <p key={service.id}>
      {[
        dateRange,
        service.role,
        service.organization,
        service.organization_address
      ].filter(Boolean).join(" / ")}
    </p>
  );
};

const formatEducation = (education) => {
  const startDate = education.start_date;
  const endDate = education.end_date ? education.end_date : "present";
  const dateRange =
    startDate && startDate === endDate
      ? endDate
      : startDate
      ? `${startDate} - ${endDate}`
      : endDate === 'present' ? undefined : endDate;

  return (
    <p key={education.id}>
      {[
        dateRange,
        education.role,
        education.organization,
        education.organization_address
      ].filter(Boolean).join(" / ")}
    </p>
  );
};

const formatDistinction = (distinction) => {
  const startDate = distinction.start_date;
  const endDate = distinction.end_date;
  const dateRange =
    startDate && startDate === endDate
      ? endDate
      : startDate
      ? `${startDate} ${endDate ? `- ${endDate}` : ""}`
      : endDate === 'present' ? undefined : endDate;

  return (
    <p key={distinction.id}>
      {[
        dateRange,
        distinction.role
      ].filter(Boolean).join(" / ")}
    </p>
  );
};

const formatLink = (link) => (
  <p key={link.id}>
    <i className="fas fa-solid fa-link" style={{ paddingRight: "3px" }}></i>
    <a href={link.url} target="_blank" rel="noopener noreferrer">
      {link.url_name || link.url}
    </a>
  </p>
);

const ResearcherInfo = ({ params }) => {
  const [showMore, setShowMore] = useState({
    biography: false,
    employments: false,
    educations: false,
    funds: false,
    distinctions: false,
    links: false,
    services: false,
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
        <TextSection
          title="BIOGRAPHY"
          content={params.biography}
          showMore={showMore.biography}
          handleShowMore={() => handleShowMore("biography")}
        />
        <Section
          title="EMPLOYMENT"
          items={params.employments}
          formatItem={formatEmployment}
          showMore={showMore.employments}
          handleShowMore={() => handleShowMore("employments")}
        />
        {/* sorting ? */}
        <Section
          title="PROFESSIONAL ACTIVITIES"
          subtitle="Services"
          items={params.services}
          formatItem={formatService}
          showMore={showMore.services}
          handleShowMore={() => handleShowMore("services")}
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
          items={params.researcher_urls}
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
      researcher_urls: state.author.researcher_urls,
      funds: state.author.funds,
      educations: state.author.educations,
      employments: state.author.employments,
      memberships: state.author.memberships,
      biography: state.author.biography,
      distinctions: state.author.distinctions,
      services: state.author.services,
    },
  };
};

export default connect(mapStateToProps)(ResearcherInfo);