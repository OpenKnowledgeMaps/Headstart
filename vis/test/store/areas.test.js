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

const RAW_DATA = [
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
];

const RAW_DATA_MULTIPLE = [
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
  {
    area: "Vaccines",
    readers: 2,
    x: -393.1506919811518,
    y: 241.9285358243851,
    area_uri: 0,
    num_readers: 2,
    internal_readers: 2,
    num_subentries: 0,
  },
];

const INITIALIZED_STATE = {
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

const INITIALIZED_STATE_MULTIPLE = {
  list: [
    {
      area_uri: 0,
      num_readers: 3,
      origR: 3,
      origX: -366.1506919811518,
      origY: -236.9285358243851,
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
        {
          area: "Vaccines",
          readers: 2,
          x: -393.1506919811518,
          y: 241.9285358243851,
          area_uri: 0,
          num_readers: 2,
          internal_readers: 2,
          num_subentries: 0,
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

const RESIZED_STATE = {
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
      r: 46.15384615384615,
      title: "Vaccines",
      x: 89.59615384615385,
      y: 89.59615384615385,
      zoomedR: 46.15384615384615,
      zoomedX: 89.59615384615385,
      zoomedY: 89.59615384615385,
    },
  ],
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
          prevZoomedHeight: undefined,
          prevZoomedWidth: undefined,
          prevZoomedX: undefined,
          prevZoomedY: undefined,
          readers: 0,
          x: -339.1506919811518,
          y: 231.9285358243851,
          zoomedHeight: NaN,
          zoomedWidth: NaN,
          zoomedX: -2990.6729724176093,
          zoomedY: 1525.6119208111788,
        },
      ],
      r: 46.15384615384615,
      title: "Vaccines",
      x: 89.59615384615385,
      y: 89.59615384615385,
      zoomedR: 360,
      zoomedX: 399.99999999999994,
      zoomedY: 399.99999999999994,
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
