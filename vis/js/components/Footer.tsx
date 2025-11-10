import { FC } from "react";
import { connect } from "react-redux";

import { useVisualizationType } from "@/hooks";

import CreatedBy from "../templates/footers/CreatedBy";
import { CreateMapButton } from "../templates/footers/CreateMapButton";
import { ServiceType, State } from "../types";

interface FooterProps {
  service: ServiceType;
  timestamp: string | undefined;
  faqsUrl: string;
  faqsUrlStr: string;
}

const SUPPORTED_SERVICES = ["base", "pubmed", "openaire", "orcid", "aquanavi"];

const Footer: FC<FooterProps> = ({
  service,
  timestamp,
  faqsUrl,
  faqsUrlStr,
}) => {
  const { isStreamgraph } = useVisualizationType();

  if (service.startsWith("triple") || SUPPORTED_SERVICES.includes(service)) {
    const FAQUrl = isStreamgraph ? faqsUrlStr : faqsUrl;

    return (
      <>
        <CreatedBy timestamp={timestamp} faqsUrl={FAQUrl} />
        <CreateMapButton />
      </>
    );
  }

  return null;
};

const mapStateToProps = (state: State) => ({
  service: state.service,
  timestamp: state.misc.timestamp,
  faqsUrl: state.modals.FAQsUrl,
  faqsUrlStr: state.modals.FAQsUrlStr,
});

export default connect(mapStateToProps)(Footer);
