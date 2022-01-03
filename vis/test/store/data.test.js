import { initializeStore, updateDimensions } from "../../js/actions";

import reducer from "../../js/reducers/data";

describe("data state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = { list: [], options: {}, size: null };

      const result = reducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should resize the papers correctly", () => {
      const result = reducer(SOME_DATA, updateDimensions({ size: 500 }, {}));

      expect(result).toEqual(RESIZED_DATA);
    });

    it("should resize the papers correctly with no data", () => {
      const result = reducer(
        { list: [], options: {}, size: null },
        updateDimensions({ size: 500 }, {})
      );

      expect(result).toEqual({ list: [], options: {}, size: null });
    });

    it("should not resize the papers if streamgraph", () => {
      const result = reducer(
        { list: [{}], options: { isStreamgraph: true }, size: null },
        updateDimensions({ size: 500 }, {})
      );

      expect(result).toEqual({
        list: [{}],
        options: { isStreamgraph: true },
        size: 500,
      });
    });

    it("should not initialize the papers if streamgraph", () => {
      const result = reducer(
        { list: [], options: {}, size: null },
        initializeStore(
          { is_streamgraph: true },
          {},
          [],
          [],
          "",
          500,
          500,
          500,
          500,
          {}
        )
      );

      expect(result).toEqual({
        list: [],
        options: {
          bubbleMaxScale: undefined,
          bubbleMinScale: undefined,
          isStreamgraph: true,
          maxAreaSize: undefined,
          maxDiameterSize: undefined,
          minDiameterSize: undefined,
          paperHeightFactor: undefined,
          paperMaxScale: undefined,
          paperMinScale: undefined,
          paperWidthFactor: undefined,
          referenceSize: undefined,
        },
        size: 500,
      });
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});

const SOME_DATA = {
  list: [
    {
      id: "1a015a70-6d03-11df-a2b2-0026b95e3eb7",
      title:
        "A framework to analyze argumentative knowledge construction in computer-supported collaborative learning",
      readers: 91,
      x: NaN,
      y: NaN,
      area: "Computer-supported Collaborative Learning",
      paper_abstract:
        "Computer-supported collaborative learning (CSCL) is often based on written argumentative discourse of learners, who discuss their perspectives on a problem with the goal to acquire knowledge. Lately, CSCL research focuses on the facilitation of specific processes of argumentative knowledge construction, e.g., with computer-supported collaboration scripts. In order to refine process-oriented instructional support, such as scripts, we need to measure the influence of scripts on specific processes of argumentative knowledge construction. In this article, we propose a multi-dimensional approach to analyze argumentative knowledge construction in CSCL from sampling and segmentation of the discourse corpora to the analysis of four process dimensions (participation, epistemic, argumentative, social mode).",
      published_in: "Computers & Education",
      year: "2006",
      url: "a-framework-to-analyze-argumentative-knowledge-construction-in-computersupported-collaborative-learning",
      file_hash: "978018f69b3e27b930a6de719bc8f285f2295793",
      authors: "Weinberger,A;Fischer,F;",
      oa_state: "0",
      comments: [],
      subject_orig: "",
      authors_string: "A Weinberger, F Fischer",
      authors_short_string: "A. Weinberger, F. Fischer",
      safe_id: "1a015a70__002d6d03__002d11df__002da2b2__002d0026b95e3eb7",
      num_readers: 91,
      internal_readers: 92,
      num_subentries: 0,
      paper_selected: false,
      oa: false,
      free_access: false,
      outlink:
        "http://mendeley.com/catalog/a-framework-to-analyze-argumentative-knowledge-construction-in-computersupported-collaborative-learning",
      comments_for_filtering: "",
      resized: false,
      area_uri: "some-uri",
      diameter: NaN,
      width: NaN,
      height: NaN,
      zoomedX: NaN,
      zoomedY: NaN,
      zoomedWidth: NaN,
      zoomedHeight: NaN,
    },
    {
      id: "bc8fff40-6d02-11df-a2b2-0026b95e3eb7",
      title: "A survey of current research on online communities of practice",
      readers: 156,
      x: NaN,
      y: NaN,
      area: "Community of Practice",
      paper_abstract:
        "The author surveys current literature on communities of practice and their potential development using networked technology and remote collaboration, specifically with respect to World Wide Web (WWW) communication tools. The vast majority of the current literature in this new research area consists of case studies. Communities of practice have the following components that distinguish them from traditional organizations and learning situations: (1) different levels of expertise that are simultaneously present in the community of practice; (2) fluid peripheral to center movement that symbolizes the progression from being a novice to an expert; and (3) completely authentic tasks and communication. Supporting concepts include aspects of constructivism (i.e., ill-structured problems, facilitation, collaborative learning, and negotiated goals), community knowledge greater than individual knowledge, as well as an environment of safety and trust. Virtual communities are defined as designed communities using current networked technology, whereas communities of practice emerge within the designed community via the ways their participants use the designed community. Current networked technology has both advantages and disadvantages in emergent development of communities of practice. Because most collaboration is text-based, norms are reduced, enabling introverted participants to share their ideas on an equal footing with extroverts. However, the greatest problem with virtual communities is withdrawing, or attrition. This problem can be reduced somewhat through good facilitation techniques and adequate scaffolding, especially in the cases of online communication techniques and technical support. Finally, the author recommends further research questions and proposes a case study, whose purpose is to observe the effects of an emerging community of practice within the designed environment of a virtual community.",
      published_in: "The Internet and Higher Education",
      year: "2001",
      url: "a-survey-of-current-research-on-online-communities-of-practice",
      file_hash: "57f25a1f63055eaf4cc1348ab070d9a6574acc00",
      authors: "Johnson,C;",
      oa_state: "1",
      comments: [],
      subject_orig: "",
      authors_string: "C Johnson",
      authors_short_string: "C. Johnson",
      safe_id: "bc8fff40__002d6d02__002d11df__002da2b2__002d0026b95e3eb7",
      num_readers: 156,
      internal_readers: 157,
      num_subentries: 0,
      paper_selected: false,
      oa: true,
      free_access: false,
      outlink:
        "http://mendeley.com/catalog/a-survey-of-current-research-on-online-communities-of-practice",
      comments_for_filtering: "",
      resized: false,
      diameter: NaN,
      width: NaN,
      height: NaN,
      zoomedX: NaN,
      zoomedY: NaN,
      zoomedWidth: NaN,
      zoomedHeight: NaN,
      area_uri: "Community of Practice",
    },
  ],
  options: {
    maxAreaSize: 200,
    referenceSize: 650,
    bubbleMinScale: 1,
    bubbleMaxScale: 1.1,
    minDiameterSize: 30,
    maxDiameterSize: 50,
    paperMinScale: 0.8,
    paperMaxScale: 1,
    paperWidthFactor: 1.2,
    paperHeightFactor: 1.6,
    isStreamgraph: false,
  },
  size: undefined,
};

const RESIZED_DATA = {
  list: [
    {
      id: "1a015a70-6d03-11df-a2b2-0026b95e3eb7",
      title:
        "A framework to analyze argumentative knowledge construction in computer-supported collaborative learning",
      readers: 91,
      x: NaN,
      y: NaN,
      area: "Computer-supported Collaborative Learning",
      paper_abstract:
        "Computer-supported collaborative learning (CSCL) is often based on written argumentative discourse of learners, who discuss their perspectives on a problem with the goal to acquire knowledge. Lately, CSCL research focuses on the facilitation of specific processes of argumentative knowledge construction, e.g., with computer-supported collaboration scripts. In order to refine process-oriented instructional support, such as scripts, we need to measure the influence of scripts on specific processes of argumentative knowledge construction. In this article, we propose a multi-dimensional approach to analyze argumentative knowledge construction in CSCL from sampling and segmentation of the discourse corpora to the analysis of four process dimensions (participation, epistemic, argumentative, social mode).",
      published_in: "Computers & Education",
      year: "2006",
      url: "a-framework-to-analyze-argumentative-knowledge-construction-in-computersupported-collaborative-learning",
      file_hash: "978018f69b3e27b930a6de719bc8f285f2295793",
      authors: "Weinberger,A;Fischer,F;",
      oa_state: "0",
      comments: [],
      subject_orig: "",
      authors_string: "A Weinberger, F Fischer",
      authors_short_string: "A. Weinberger, F. Fischer",
      safe_id: "1a015a70__002d6d03__002d11df__002da2b2__002d0026b95e3eb7",
      num_readers: 91,
      internal_readers: 92,
      num_subentries: 0,
      paper_selected: false,
      oa: false,
      free_access: false,
      outlink:
        "http://mendeley.com/catalog/a-framework-to-analyze-argumentative-knowledge-construction-in-computersupported-collaborative-learning",
      comments_for_filtering: "",
      resized: false,
      area_uri: "some-uri",
      diameter: 18.461538461538463,
      width: 13.739232139112323,
      height: 18.3189761854831,
      zoomedX: NaN,
      zoomedY: NaN,
      zoomedWidth: NaN,
      zoomedHeight: NaN,
    },
    {
      id: "bc8fff40-6d02-11df-a2b2-0026b95e3eb7",
      title: "A survey of current research on online communities of practice",
      readers: 156,
      x: NaN,
      y: NaN,
      area: "Community of Practice",
      paper_abstract:
        "The author surveys current literature on communities of practice and their potential development using networked technology and remote collaboration, specifically with respect to World Wide Web (WWW) communication tools. The vast majority of the current literature in this new research area consists of case studies. Communities of practice have the following components that distinguish them from traditional organizations and learning situations: (1) different levels of expertise that are simultaneously present in the community of practice; (2) fluid peripheral to center movement that symbolizes the progression from being a novice to an expert; and (3) completely authentic tasks and communication. Supporting concepts include aspects of constructivism (i.e., ill-structured problems, facilitation, collaborative learning, and negotiated goals), community knowledge greater than individual knowledge, as well as an environment of safety and trust. Virtual communities are defined as designed communities using current networked technology, whereas communities of practice emerge within the designed community via the ways their participants use the designed community. Current networked technology has both advantages and disadvantages in emergent development of communities of practice. Because most collaboration is text-based, norms are reduced, enabling introverted participants to share their ideas on an equal footing with extroverts. However, the greatest problem with virtual communities is withdrawing, or attrition. This problem can be reduced somewhat through good facilitation techniques and adequate scaffolding, especially in the cases of online communication techniques and technical support. Finally, the author recommends further research questions and proposes a case study, whose purpose is to observe the effects of an emerging community of practice within the designed environment of a virtual community.",
      published_in: "The Internet and Higher Education",
      year: "2001",
      url: "a-survey-of-current-research-on-online-communities-of-practice",
      file_hash: "57f25a1f63055eaf4cc1348ab070d9a6574acc00",
      authors: "Johnson,C;",
      oa_state: "1",
      comments: [],
      subject_orig: "",
      authors_string: "C Johnson",
      authors_short_string: "C. Johnson",
      safe_id: "bc8fff40__002d6d02__002d11df__002da2b2__002d0026b95e3eb7",
      num_readers: 156,
      internal_readers: 157,
      num_subentries: 0,
      paper_selected: false,
      oa: true,
      free_access: false,
      outlink:
        "http://mendeley.com/catalog/a-survey-of-current-research-on-online-communities-of-practice",
      comments_for_filtering: "",
      resized: false,
      diameter: 38.46153846153847,
      width: 28.623400289817337,
      height: 38.164533719756456,
      zoomedX: NaN,
      zoomedY: NaN,
      zoomedWidth: NaN,
      zoomedHeight: NaN,
      area_uri: "Community of Practice",
    },
  ],
  options: {
    maxAreaSize: 200,
    referenceSize: 650,
    bubbleMinScale: 1,
    bubbleMaxScale: 1.1,
    minDiameterSize: 30,
    maxDiameterSize: 50,
    paperMinScale: 0.8,
    paperMaxScale: 1,
    paperWidthFactor: 1.2,
    paperHeightFactor: 1.6,
    isStreamgraph: false,
  },
  size: 500,
};
