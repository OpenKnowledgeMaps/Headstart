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
    append: (paper) => {
      // feature request from Peter, not an official part of ACM
      if (!paper.list_link.isDoi) {
        return " " + paper.list_link.address;
      }

      return "";
    },
  },
];

const useCitationStyle = () => {
  const [style, setStyle] = useState(availableStyles[0]);

  const getCitation = (paper) => {
    // format derived from the example JSON: https://citation.js.org/demo/
    // full list of parameters: node_modules/@citation-js/core/lib/plugins/input/csl.js
    const cite = new Cite({
      id: paper.safe_id,
      title: paper.title,
      author: paper.authors_objects.map((a) => ({
        given: a.firstName,
        family: a.lastName,
      })),
      issued: [{ "date-parts": paper.year.split("-") }],
      "container-title": paper.published_in,
      DOI: paper.list_link.isDoi
        ? paper.list_link.address.replace(/(https?:\/\/)?(\w+\.)?doi.org\//, "")
        : undefined,
      URL: paper.list_link.isDoi ? undefined : paper.list_link.address,
      // this information could be misleading, so we'll hide it for now:
      //source: "Open Knowledge Maps",
      type: getType(paper),
    });

    let output = cite.format("bibliography", {
      template: style.template,
    });

    if (style.append) {
      output += style.append(paper);
    }

    return output;
  };

  return [style, setStyle, getCitation];
};

export default useCitationStyle;

// mapping of BASE type to CSL type
const TYPE_TO_TYPE = [
  ["Journal/newspaper article", "article-journal"],
  ["Journal/newspaper other content", "article-journal"],
  ["Journal/newspaper", "periodical"],
  ["Book", "book"],
  ["Book part", "chapter"],
  ["Conference object", "paper-conference"],
  ["Dataset", "dataset"],
  ["Manuscript", "manuscript"],
  ["Map", "map"],
  ["Moving image/video", "motion_picture"],
  ["Patent", "patent"],
  ["Report", "report"],
  ["Review", "review"],
  ["Software", "software"],
  ["Still image", "graphic"],
  ["Thesis", "thesis"],
  ["Thesis: bachelor", "thesis"],
  ["Thesis: doctoral and postdoctoral", "thesis"],
  ["Thesis: master", "thesis"],
];

const getType = (paper) => {
  const types = paper.resulttype;
  if (!types || types.length === 0) {
    return undefined;
  }

  for (const entry of TYPE_TO_TYPE) {
    if (types.includes(entry[0])) {
      return entry[1];
    }
  }

  return undefined;
};
