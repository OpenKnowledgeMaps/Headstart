import DataManager from "../../js/dataprocessing/managers/DataManager";

import {
  productionKMConfig,
  productionKMData,
  productionKMDataModified,
} from "../data/base-raw";

const config = {
  show_context: true,
  language: "en",
  localization: { en: {} },
};

describe("default data manager", () => {
  it("doesn't crash", () => {
    const EXPECTED_PAPERS = [];

    const dataManager = new DataManager(config);
    dataManager.parseData({ data: [] });

    const papers = dataManager.papers;

    expect(papers).toEqual(EXPECTED_PAPERS);
  });

  describe("real BASE map data", () => {
    console.warn = jest.fn();

    it("parses correct number of documents", () => {
      const EXPECTED_PAPERS_LENGTH = 2;

      const dataManager = new DataManager(productionKMConfig);
      dataManager.parseData(productionKMData, 500);

      const papers = dataManager.papers;

      expect(papers.length).toEqual(EXPECTED_PAPERS_LENGTH);
    });

    it("creates a correct safe id", () => {
      const EXPECTED_SAFE_ID = "unsafe__0026dangerous-id";

      const dataManager = new DataManager(productionKMConfig);
      dataManager.parseData(productionKMDataModified, 500);

      const papers = dataManager.papers;

      expect(papers[0].safe_id).toEqual(EXPECTED_SAFE_ID);
    });

    it("moves a paper with the exact same coordinates as another paper", () => {
      const EXPECTED_X0 = 5;
      const EXPECTED_Y0 = 5;
      const EXPECTED_X1 = 5;
      const EXPECTED_Y1 = 495;

      const dataManager = new DataManager(productionKMConfig);
      dataManager.parseData(productionKMDataModified, 500);

      const papers = dataManager.papers;

      expect(papers[0].x).toEqual(EXPECTED_X0);
      expect(papers[0].y).toEqual(EXPECTED_Y0);
      expect(papers[1].x).toEqual(EXPECTED_X1);
      expect(papers[1].y).toEqual(EXPECTED_Y1);
    });
  });
});
