import {
  applyForceAreas,
  initializeStore,
  updateDimensions,
  zoomIn,
} from "../../js/actions";

import reducer from "../../js/reducers/areas";

describe("areas state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = { list: [], size: null, options: {} };

      const result = reducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should return the initialized state", () => {
      const INITIAL_STATE = { list: [], size: null, options: {} };

      const result = reducer(
        INITIAL_STATE,
        initializeStore(
          {
            min_area_size: 50,
            max_area_size: 110,
            reference_size: 650,
            zoom_factor: 0.9,
          },
          {},
          [],
          RAW_DATA,
          "",
          800,
          null,
          null,
          800,
          { bubbleMinScale: 1, bubbleMaxScale: 1.1 }
        )
      );

      expect(result).toEqual(INITIALIZED_STATE);
    });

    it("should return the initialized state with multiple papers", () => {
      const INITIAL_STATE = { list: [], size: null, options: {} };

      const result = reducer(
        INITIAL_STATE,
        initializeStore(
          {
            min_area_size: 50,
            max_area_size: 110,
            reference_size: 650,
            zoom_factor: 0.9,
          },
          {},
          [],
          RAW_DATA_MULTIPLE,
          "",
          800,
          null,
          null,
          800,
          { bubbleMinScale: 1, bubbleMaxScale: 1.1 }
        )
      );

      expect(result).toEqual(INITIALIZED_STATE_MULTIPLE);
    });

    it("should return the resized state", () => {
      const result = reducer(
        INITIALIZED_STATE,
        updateDimensions({ size: 600 }, {})
      );
      expect(result).toEqual(RESIZED_STATE);
    });

    it("should return the zoomed in state", () => {
      const result = reducer(
        INITIALIZED_STATE,
        zoomIn({ uri: INITIALIZED_STATE.list[0].area_uri }, undefined, false)
      );
      expect(result).toEqual(ZOOMED_STATE);
    });

    it("should return the forced state", () => {
      const result = reducer(
        INITIALIZED_STATE,
        applyForceAreas(INITIALIZED_STATE.list, 800)
      );
      expect(result).toEqual(INITIALIZED_STATE);
    });

    it("should not change the state if the action is canceled", () => {
      const result = reducer(INITIALIZED_STATE, { canceled: true });

      expect(result).toEqual(INITIALIZED_STATE);
    });

    it("should not change the state if the action is streamgraph", () => {
      const result = reducer(INITIALIZED_STATE, { isStreamgraph: true });

      expect(result).toEqual(INITIALIZED_STATE);
    });
  });
});

const RAW_DATA = [{ area: "test area", papers: [] }];

const RAW_DATA_MULTIPLE = [{ area: "test area" }, { area: "another area" }];

const INITIALIZED_STATE = {
  list: RAW_DATA,
  size: 800,
  options: {
    bubbleMaxScale: 1.1,
    bubbleMinScale: 1,
    maxAreaSize: 110,
    minAreaSize: 50,
    referenceSize: 650,
    zoomFactor: 0.9,
  },
};

const INITIALIZED_STATE_MULTIPLE = {
  list: RAW_DATA_MULTIPLE,
  size: 800,
  options: {
    bubbleMaxScale: 1.1,
    bubbleMinScale: 1,
    maxAreaSize: 110,
    minAreaSize: 50,
    referenceSize: 650,
    zoomFactor: 0.9,
  },
};

const RESIZED_STATE = {
  list: RAW_DATA,
  size: 600,
  options: {
    bubbleMaxScale: 1.1,
    bubbleMinScale: 1,
    maxAreaSize: 110,
    minAreaSize: 50,
    referenceSize: 650,
    zoomFactor: 0.9,
  },
};

const ZOOMED_STATE = {
  list: RAW_DATA,
  size: 800,
  options: {
    bubbleMaxScale: 1.1,
    bubbleMinScale: 1,
    maxAreaSize: 110,
    minAreaSize: 50,
    referenceSize: 650,
    zoomFactor: 0.9,
  },
};
