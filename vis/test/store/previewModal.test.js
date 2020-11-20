import { showPreview, hidePreview } from "../../js/actions";

import previewModalReducer from "../../js/reducers/previewModal";

describe("list state", () => {
  describe("actions", () => {
    it("should create a show preview action", () => {
      const PAPER = {
        id: "some-id",
        safe_id: "some-safe-id",
        title: "some title",
      };
      const EXPECTED_ACTION = {
        type: "SHOW_PREVIEW",
        paper: PAPER,
      };
      expect(showPreview(PAPER)).toEqual(EXPECTED_ACTION);
    });

    it("should create a hide preview action", () => {
      const EXPECTED_ACTION = {
        type: "HIDE_PREVIEW",
      };
      expect(hidePreview()).toEqual(EXPECTED_ACTION);
    });
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_STATE = { show: false, paper: null };

      const result = previewModalReducer(undefined, {});

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should show the preview", () => {
      const PAPER = {
        area: "some area",
        area_uri: "some-uri",
      };

      const INITIAL_STATE = { show: false, paper: null };
      const EXPECTED_STATE = { ...INITIAL_STATE, show: true, paper: PAPER };

      const result = previewModalReducer(INITIAL_STATE, showPreview(PAPER));

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should hide the preview", () => {
      const PAPER = {
        area: "some area",
        area_uri: "some-uri",
      };

      const INITIAL_STATE = { show: true, paper: PAPER };
      const EXPECTED_STATE = { ...INITIAL_STATE, show: false, paper: null };

      const result = previewModalReducer(INITIAL_STATE, hidePreview());

      expect(result).toEqual(EXPECTED_STATE);
    });
  });
});
