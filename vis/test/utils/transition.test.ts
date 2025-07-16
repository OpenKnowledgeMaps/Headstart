import { describe, it, expect, vi } from "vitest";

vi.mock("d3-transition", () => {
  const mockDuration = vi.fn().mockReturnThis();
  const mockEase = vi.fn().mockReturnThis();
  const mockOn = vi.fn().mockReturnThis();

  const mockTransition = {
    duration: mockDuration,
    ease: mockEase,
    on: mockOn,
  };

  return {
    transition: vi.fn(() => mockTransition),
    __esModule: true,
    _mocks: {
      mockTransition,
      mockDuration,
      mockEase,
      mockOn,
    },
  };
});

vi.mock("d3-ease", () => {
  const mockExponent = vi.fn(() => "mocked-easing-fn");
  return {
    easePolyInOut: { exponent: mockExponent },
    __esModule: true,
    _mocks: {
      mockExponent,
    },
  };
});

import { createTransition } from "../../js/utils/transition";

describe("The createTransition function", async () => {
  it("creates a transition with specified duration, easing and end callback", async () => {
    const transitionModule = await import("d3-transition");
    const tMocks = (transitionModule as any)._mocks;

    const easeModule = await import("d3-ease");
    const eMocks = (easeModule as any)._mocks;

    const mockCallback = vi.fn();
    const result = createTransition(400, mockCallback);

    expect(transitionModule.transition).toHaveBeenCalled();
    expect(tMocks.mockDuration).toHaveBeenCalledWith(400);
    expect(eMocks.mockExponent).toHaveBeenCalledWith(3);
    expect(tMocks.mockEase).toHaveBeenCalledWith("mocked-easing-fn");
    expect(tMocks.mockOn).toHaveBeenCalledWith("end", mockCallback);
    expect(result).toEqual(tMocks.mockTransition);
  });
});
