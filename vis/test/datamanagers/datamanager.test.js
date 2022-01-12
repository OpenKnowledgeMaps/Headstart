import DataManager from "../../js/datamanagers/DataManager";

const config = {
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
});
