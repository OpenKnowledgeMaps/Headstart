import {
  getCoordsScale,
  getDiameterScale,
  getInitialCoordsScale,
  getRadiusScale,
  getResizedScale,
  getZoomScale,
} from "../../js/utils/scale";

describe("Scale functions", () => {
  describe("getCoordsScale", () => {
    it("Scale coordinates correctly", () => {
      const scaleFn = getCoordsScale([0, 100], 500, {
        maxAreaSize: 50,
        referenceSize: 500,
        bubbleMaxScale: 1,
      });

      const result = scaleFn(50);

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(500);
    });
  });

  describe("getRadiusScale", () => {
    it("Scale radius correctly", () => {
      const scaleFn = getRadiusScale([0, 10], 400, {
        minAreaSize: 10,
        maxAreaSize: 50,
        referenceSize: 400,
        bubbleMinScale: 1,
        bubbleMaxScale: 2,
      });

      const small = scaleFn(0);
      const big = scaleFn(10);

      expect(big).toBeGreaterThan(small);
    });
  });

  describe("getDiameterScale", () => {
    it("Scale diameter correctly", () => {
      const scaleFn = getDiameterScale([1, 5], 300, {
        referenceSize: 300,
        minDiameterSize: 10,
        maxDiameterSize: 30,
        paperMinScale: 1,
        paperMaxScale: 2,
      });

      const small = scaleFn(1);
      const big = scaleFn(5);

      expect(big).toBeGreaterThan(small);
    });
  });

  describe("getInitialCoordsScale", () => {
    it("Scale initial coordinates correctly", () => {
      const scaleFn = getInitialCoordsScale([0, 100], 200);

      expect(scaleFn(0)).toBeGreaterThan(0);
      expect(scaleFn(100)).toBeLessThan(200);
    });
  });

  describe("getResizedScale", () => {
    it("Resize coordinates from old size to new size", () => {
      const scaleFn = getResizedScale(100, 200);

      expect(scaleFn(0)).toBe(0);
      expect(scaleFn(100)).toBe(200);
      expect(scaleFn(50)).toBe(100);
    });
  });

  describe("getZoomScale", () => {
    it("Zoom coordinates correctly for bubbles", () => {
      const scaleFn = getZoomScale(100, 50, 400, "bubble");
      const val = scaleFn(100);

      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThan(400);
    });

    it("Zoom coordinates correctly for papers", () => {
      const scaleFn = getZoomScale(200, 80, 500, "paper");
      const val = scaleFn(250);

      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThan(500);
    });
  });
});
