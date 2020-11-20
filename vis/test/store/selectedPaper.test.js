import {
  zoomOut,
  selectPaper,
  selectPaperFromMediator,
  deselectPaper,
  deselectPaperBacklink,
} from "../../js/actions";

import selectedPaperReducer from "../../js/reducers/selectedPaper";

describe("list state", () => {
  describe("actions", () => {
    it("should create a select paper action", () => {
      const PAPER = {
        id: "some-id",
        safe_id: "some-safe-id",
        title: "some title",
      }
      const EXPECTED_ACTION = {
        type: "SELECT_PAPER",
        safeId: PAPER.safe_id,
        paper: PAPER,
        not_from_mediator: true,
      };
      expect(selectPaper(PAPER)).toEqual(EXPECTED_ACTION);
    });

    it("should create a select paper from mediator action", () => {
      const SAFE_ID = "safe-id";
      const EXPECTED_ACTION = {
        type: "SELECT_PAPER",
        safeId: SAFE_ID
      };
      expect(selectPaperFromMediator(SAFE_ID)).toEqual(EXPECTED_ACTION);
    });

    it("should create a deselect paper action", () => {
      const EXPECTED_ACTION = {
        type: "DESELECT_PAPER",
      };
      expect(deselectPaper()).toEqual(EXPECTED_ACTION);
    });

    it("should create a deselect paper backlink action", () => {
      const EXPECTED_ACTION = {
        type: "DESELECT_PAPER_BACKLINK",
      };
      expect(deselectPaperBacklink()).toEqual(EXPECTED_ACTION);
    });
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_STATE = null;

      const result = selectedPaperReducer(undefined, {});

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should select the paper", () => {
      const PAPER = {
        safe_id: "some-id",
      };

      const INITIAL_STATE = null;
      const EXPECTED_STATE = {
        safeId: PAPER.safe_id,
      };

      const result = selectedPaperReducer(INITIAL_STATE, selectPaper(PAPER));

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should deselect the paper", () => {
      const PAPER = {
        safe_id: "some-id",
      };

      const INITIAL_STATE = {
        safeId: PAPER.safe_id,
      };
      const EXPECTED_STATE = null;

      const result = selectedPaperReducer(INITIAL_STATE, deselectPaper());

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should deselect the paper (from backlink)", () => {
      const PAPER = {
        safe_id: "some-id",
      };

      const INITIAL_STATE = {
        safeId: PAPER.safe_id,
      };
      const EXPECTED_STATE = null;

      const result = selectedPaperReducer(INITIAL_STATE, deselectPaperBacklink());

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should deselect the paper (on zoom out)", () => {
      const PAPER = {
        safe_id: "some-id",
      };

      const INITIAL_STATE = {
        safeId: PAPER.safe_id,
      };
      const EXPECTED_STATE = null;

      const result = selectedPaperReducer(INITIAL_STATE, zoomOut());

      expect(result).toEqual(EXPECTED_STATE);
    });
  });
});
