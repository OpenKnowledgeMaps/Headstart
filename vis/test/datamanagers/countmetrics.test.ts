import { BasePaper, OrcidPaper, Paper, PubmedPaper } from "../../js/types";
import DataManager from "../../js/dataprocessing/managers/DataManager";
import { productionKMConfig } from "../data/base-raw";
import {
  MOCK_BASE_PAPER_DATA,
  MOCK_ORCID_PAPER_DATA,
  MOCK_PUBMED_PAPER_DATA,
} from "../data/papers";

describe("The private function __countMetrics of the DataManager (with PubMed)", () => {
  const setupAndRunCountMetrics = (
    paper: PubmedPaper = MOCK_PUBMED_PAPER_DATA,
  ): PubmedPaper => {
    // Create the instance of DataManager class
    const dataManager = new DataManager(productionKMConfig);

    // Mock papers data at the instance of DataManager class
    dataManager.papers = [paper];

    // Run __countMetrics method of DataManager class with mocked paper data
    dataManager.__countMetrics(paper as any as Paper);

    // Get paper after processing it with __countMetrics
    const processedPaper: PubmedPaper = dataManager.papers[0];
    return processedPaper;
  };

  describe("Citation count tests", () => {
    it("Works correctly when citations count was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 15;

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        citation_count: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });

    it("Works correctly when citations count was not provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });

    it("Works correctly when citations count provided as n/a", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        citation_count: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Social citations count test", () => {
    it("Works when no citations data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Readers test", () => {
    it("Works when no readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        readers: null as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 999;

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        readers: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided, but it is invalid", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        readers: "string" as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });
  });

  describe("References count test", () => {
    it("Doesn't provide references information for PubMed integration", () => {
      // Defining expected result
      const EXPECTED_RESULT = null;

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { references } = paper;
      expect(references).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Number readers test", () => {
    it("Works when no readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        readers: null as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 999;

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        readers: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided, but it is invalid", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: PubmedPaper = {
        ...MOCK_PUBMED_PAPER_DATA,
        readers: "string" as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });
  });
});

describe("The private function __countMetrics of the DataManager (with BASE)", () => {
  const setupAndRunCountMetrics = (
    paper: BasePaper = MOCK_BASE_PAPER_DATA,
  ): BasePaper => {
    // Create the instance of DataManager class
    const dataManager = new DataManager(productionKMConfig);

    // Mock papers data at the instance of DataManager class
    dataManager.papers = [paper];

    // Run __countMetrics method of DataManager class with mocked paper data
    dataManager.__countMetrics(paper as any as Paper);

    // Get paper after processing it with __countMetrics
    const processedPaper: BasePaper = dataManager.papers[0];
    return processedPaper;
  };

  describe("Citation count tests", () => {
    it("Works correctly when citations count was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 15;

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        citation_count: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });

    it("Works correctly when citations count was not provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });

    it("Works correctly when citations count provided as n/a", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        citation_count: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Social citations count test", () => {
    it("Works when no citations data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { social } = paper;
      expect(social).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Readers test", () => {
    it("Works when no readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        readers: null as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 999;

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        readers: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided, but it is invalid", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        readers: "string" as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });
  });

  describe("References count test", () => {
    it("Doesn't provide references information for BASE integration", () => {
      // Defining expected result
      const EXPECTED_RESULT = null;

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { references } = paper;
      expect(references).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Number readers test", () => {
    it("Works when no readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        readers: null as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 999;

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        readers: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided, but it is invalid", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: BasePaper = {
        ...MOCK_BASE_PAPER_DATA,
        readers: "string" as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });
  });
});

describe("The private function __countMetrics of the DataManager (with ORCID)", () => {
  const setupAndRunCountMetrics = (
    paper: OrcidPaper = MOCK_ORCID_PAPER_DATA,
  ): OrcidPaper => {
    // Create the instance of DataManager class
    const dataManager = new DataManager(productionKMConfig);

    // Mock papers data at the instance of DataManager class
    dataManager.papers = [paper];

    // Run __countMetrics method of DataManager class with mocked paper data
    dataManager.__countMetrics(paper as any as Paper);

    // Get paper after processing it with __countMetrics
    const processedPaper: OrcidPaper = dataManager.papers[0];
    return processedPaper;
  };

  describe("Citation count tests", () => {
    it("Works correctly when citations count was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 15;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        citation_count: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });

    it("Works correctly when citations count was not provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });

    it("Works correctly when citations count provided as n/a", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        citation_count: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { citation_count } = paper;
      expect(citation_count).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Social citations count test", () => {
    it("Works when no citations data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = "n/a";

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { social } = paper;
      expect(social).toEqual(EXPECTED_RESULT);
    });

    it("Works when citations data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 5;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        cited_by_fbwalls_count: 1,
        cited_by_feeds_count: "1",
        cited_by_gplus_count: 3,
        cited_by_rdts_count: 0,
        cited_by_qna_count: null,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { social } = paper;
      expect(social).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Readers test", () => {
    it("Works when no readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        readers: null as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 999;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        readers: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided, but it is invalid", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        readers: "string" as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { readers } = paper;
      expect(readers).toEqual(EXPECTED_RESULT);
    });
  });

  describe("References count test", () => {
    it("Doesn't provide references information for ORCID integration", () => {
      // Defining expected result
      const EXPECTED_RESULT = null;

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics();

      // Checks that real result is equal to expected
      const { references } = paper;
      expect(references).toEqual(EXPECTED_RESULT);
    });
  });

  describe("Number readers test", () => {
    it("Works when no readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        readers: null as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided", () => {
      // Defining expected result
      const EXPECTED_RESULT = 999;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        readers: EXPECTED_RESULT,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });

    it("Works when readers data was provided, but it is invalid", () => {
      // Defining expected result
      const EXPECTED_RESULT = 0;

      // Modifying paper data
      const modifiedMockPaperData: OrcidPaper = {
        ...MOCK_ORCID_PAPER_DATA,
        readers: "string" as any as number,
      };

      // Run function that will create instance of DataManager and run __countMetrics
      const paper = setupAndRunCountMetrics(modifiedMockPaperData);

      // Checks that real result is equal to expected
      const { num_readers } = paper;
      expect(num_readers).toEqual(EXPECTED_RESULT);
    });
  });
});
