import {
  closeCitationModal,
  closeEmbedModal,
  closeInfoModal,
  closeViperEditModal,
  hideCitePaper,
  hidePreview,
  openCitationModal,
  openEmbedModal,
  openInfoModal,
  openViperEditModal,
  showCitePaper,
  showPreview,
  zoomIn,
} from "../../js/actions";

import reducer from "../../js/reducers/modals";

describe("modals state", () => {
  const EXAMPLE_PAPER = {
    title: "test paper",
  };

  it("should return the initial state", () => {
    const EXPECTED_RESULT = { reloadApiProperties: {}, infoParams: {} };

    const result = reducer(undefined, {});

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should return the state after zoom in", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, zoomIn({}, null, false));

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openInfoModal: false,
      openEmbedModal: false,
      openViperEditModal: false,
      openCitationModal: false,
      previewedPaper: null,
      citedPaper: null,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should show the paper citation modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, showCitePaper(EXAMPLE_PAPER));

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      citedPaper: EXAMPLE_PAPER,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should hide the paper citation modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, hideCitePaper());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      citedPaper: null,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should show the map citation modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, openCitationModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openCitationModal: true,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should hide the map citation modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, closeCitationModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openCitationModal: false,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should show the embed modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, openEmbedModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openEmbedModal: true,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should hide the embed modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, closeEmbedModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openEmbedModal: false,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should show the viper edit modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, openViperEditModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openViperEditModal: true,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should hide the viper edit modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, closeViperEditModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openViperEditModal: false,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should show the info modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, openInfoModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openInfoModal: true,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should hide the info modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, closeInfoModal());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      openInfoModal: false,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should show the preview modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, showPreview(EXAMPLE_PAPER));

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      previewedPaper: EXAMPLE_PAPER,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });

  it("should hide the preview modal", () => {
    const INITIAL_STATE = {};

    const result = reducer(INITIAL_STATE, hidePreview());

    const EXPECTED_RESULT = {
      ...INITIAL_STATE,
      previewedPaper: null,
    };

    expect(result).toEqual(EXPECTED_RESULT);
  });
});
