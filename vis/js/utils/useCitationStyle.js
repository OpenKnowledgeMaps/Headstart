import { useState } from "react";

import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";

import apaCsl from "../../csl/apa.csl";
import mlaCsl from "../../csl/mla.csl";
import chiCsl from "../../csl/chicago.csl";
import acmCsl from "../../csl/acm.csl";

const citationConfig = plugins.config.get("@csl");
citationConfig.templates.add("custom-apa", apaCsl);
citationConfig.templates.add("custom-mla", mlaCsl);
citationConfig.templates.add("custom-chi", chiCsl);
citationConfig.templates.add("custom-acm", acmCsl);

export const availableStyles = [
  {
    id: "apa",
    name: "APA",
    template: "custom-apa",
    description: "American Psychological Association 7th edition",
  },
  {
    id: "mla",
    name: "MLA",
    template: "custom-mla",
    description: "Modern Language Association 8th edition",
  },
  {
    id: "chi",
    name: "Chicago",
    template: "custom-chi",
    description: "Chicago Manual of Style 17th edition (author-date)",
  },
  {
    id: "acm",
    name: "ACM",
    template: "custom-acm",
    description: 'ACM SIG Proceedings ("et al." for 3+ authors)',
  },
];

const useCitationStyle = () => {
  const [style, setStyle] = useState(availableStyles[0]);

  const getCitation = (paper) => {
    // format derived from the example JSON: https://citation.js.org/demo/
    const cite = new Cite({
      id: paper.safe_id,
      title: paper.title,
      author: paper.authors_objects.map((a) => ({
        given: a.firstName,
        family: a.lastName,
      })),
      issued: [{ "date-parts": paper.year.split("-") }],
      "container-title": paper.published_in,
      DOI: paper.list_link.isDoi ? paper.list_link.address : undefined,
      url: paper.list_link.isDoi ? undefined : paper.list_link.address,
      // other possible attributes: "type", "volume", "issue", "page", ???
    });

    return cite.format("bibliography", {
      template: style.template,
    });
  };

  return [style, setStyle, getCitation];
};

export default useCitationStyle;
