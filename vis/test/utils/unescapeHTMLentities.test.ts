import { describe } from "vitest";
import { unescapeHTML } from "../../js/utils/unescapeHTMLentities";

describe("Unescape HTML entities function", () => {
  it("Single HTML entities decoded", () => {
    expect(unescapeHTML("&amp;")).toBe("&");
    expect(unescapeHTML("&lt;")).toBe("<");
    expect(unescapeHTML("&gt;")).toBe(">");
    expect(unescapeHTML("&quot;")).toBe('"');
    expect(unescapeHTML("&#34;")).toBe('"');
    expect(unescapeHTML("&#39;")).toBe("'");
    expect(unescapeHTML("&#x2F;")).toBe("/");
    expect(unescapeHTML("&#x60;")).toBe("`");
    expect(unescapeHTML("&#x3D;")).toBe("=");
  });

  it("Multiple entities in a single string decoded", () => {
    const input =
      "&lt;div class=&#34;test&#34;&gt;Hello &amp; Welcome&#x2F;&lt;&#x2F;div&gt;";
    const expected = '<div class="test">Hello & Welcome/</div>';
    expect(unescapeHTML(input)).toBe(expected);
  });

  it("String unchanged if no entities present", () => {
    const input = "Plain text with no HTML entities";
    expect(unescapeHTML(input)).toBe(input);
  });

  it("Empty string input handled", () => {
    expect(unescapeHTML("")).toBe("");
  });

  it("Non-string input converted to string", () => {
    expect(unescapeHTML(123 as any as string)).toBe("123");
    expect(unescapeHTML(null as any)).toBe("null");
    expect(unescapeHTML(undefined as any)).toBe("undefined");
    expect(unescapeHTML(true as any)).toBe("true");
  });
});
