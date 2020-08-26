import { changeFile } from "../../js/actions";

import reducer from "../../js/reducers/files";

describe("files state", () => {
  describe("actions", () => {
    it("should create a file clicked action", () => {
      const expectedAction = {
        type: "FILE_CLICKED",
        fileIndex: 2,
      };
      expect(changeFile(2)).toEqual(expectedAction);
    });
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      const expectedResult = { current: 0, list: [] };

      const result = reducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the file clicked action", () => {
      const initialState = {
        current: 0,
        list: [
          {
            title: "edu1",
            file: "./data/edu1.csv",
          },
          {
            title: "edu2",
            file: "./data/edu2.csv",
          },
        ],
      };
      const expectedResult = {
        current: 1,
        list: [
          {
            title: "edu1",
            file: "./data/edu1.csv",
          },
          {
            title: "edu2",
            file: "./data/edu2.csv",
          },
        ],
      };

      const result = reducer(initialState, changeFile(1));

      expect(result).toEqual(expectedResult);
    });
  });
});
