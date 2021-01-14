import { initializeStore } from "../../js/actions";

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
            bubble_min_scale: 1,
            bubble_max_scale: 1.1,
            zoom_factor: 0.9,
          },
          {},
          [
            {
              area: "Vaccines",
              readers: 0,
              x: -339.1506919811518,
              y: 231.9285358243851,
              area_uri: 0,
              num_readers: 0,
              internal_readers: 1,
              num_subentries: 0,
            },
          ],
          800
        )
      );

      const EXPECTED_RESULT = {
        list: [
          {
            area_uri: 0,
            num_readers: 1,
            origR: 1,
            origX: -339.1506919811518,
            origY: -231.9285358243851,
            papers: [
              {
                area: "Vaccines",
                area_uri: 0,
                internal_readers: 1,
                num_readers: 0,
                num_subentries: 0,
                readers: 0,
                x: -339.1506919811518,
                y: 231.9285358243851,
              },
            ],
            r: 61.53846153846154,
            title: "Vaccines",
            x: 119.46153846153847,
            y: 119.46153846153847,
            zoomedR: 61.53846153846154,
            zoomedX: 119.46153846153847,
            zoomedY: 119.46153846153847,
          },
        ],
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

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });

    it("should not change the state if the action is streamgraph", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { isStreamgraph: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
