import { isDefined } from "../../js/utils/isDefined";

describe("The isDefined util function tests", () => {
  it("Returns false when null passed", () => {
    const valueToCheck = null;
    const result = isDefined(valueToCheck);

    expect(result).toBe(false);
  });

  it("Returns false when undefined passed", () => {
    const valueToCheck = undefined;
    const result = isDefined(valueToCheck);

    expect(result).toBe(false);
  });

  it("Returns true when empty array/object passed", () => {
    const arrayValueToCheck = [] as unknown[];
    const objectValueToCheck = {};

    const arrayResult = isDefined(arrayValueToCheck);
    const objectResult = isDefined(objectValueToCheck);

    expect(arrayResult).toBe(true);
    expect(objectResult).toBe(true);
  });

  it("Returns true when any number passed", () => {
    const positiveNumberToCheck = 0;
    const negativeNumberToCheck = -10;

    const positiveNumberResult = isDefined(positiveNumberToCheck);
    const negativeNumberResult = isDefined(negativeNumberToCheck);

    expect(positiveNumberResult).toBe(true);
    expect(negativeNumberResult).toBe(true);
  });

  it("Returns true when any string passed", () => {
    const emptyStringToCheck = "";
    const stringToCheck = "Some string";

    const emptyStringResult = isDefined(emptyStringToCheck);
    const stringResult = isDefined(stringToCheck);

    expect(emptyStringResult).toBe(true);
    expect(stringResult).toBe(true);
  });

  it("Returns true when any boolean passed", () => {
    const trueBooleanToCheck = true;
    const falseBooleanToCheck = false;

    const trueBooleanResult = isDefined(trueBooleanToCheck);
    const falseBooleanResult = isDefined(falseBooleanToCheck);

    expect(trueBooleanResult).toBe(true);
    expect(falseBooleanResult).toBe(true);
  });
});
