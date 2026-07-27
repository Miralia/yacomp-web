import { describe, expect, test } from "bun:test";
import { slowPicsCollectionToGrid, type SlowPicsCollection } from "../../src/embed";

function collection(): SlowPicsCollection {
  return {
    key: "collection1",
    name: "Example",
    comparisons: [
      {
        key: "row1",
        images: [
          { name: "(B) Source.One", publicFileName: "source.png", width: 1920, height: 1080 },
          { name: "Encode.One (P)", publicFileName: "encode.png", width: 1920, height: 1080 },
        ],
      },
      {
        key: "row2",
        images: [
          { name: "(I) Source.Two", publicFileName: "source2.png", width: 1920, height: 1080 },
          { name: "Encode.Two (B)", publicFileName: "encode2.png", width: 1920, height: 1080 },
        ],
      },
    ],
  };
}

describe("slowPicsCollectionToGrid", () => {
  test("preserves row labels and constructs direct CDN URLs", () => {
    const grid = slowPicsCollectionToGrid(collection());

    expect(grid.numCols).toBe(2);
    expect(grid.names).toEqual(["Source One", "Encode One (P)"]);
    expect(grid.rowNames).toEqual([
      ["(B) Source One", "Encode One (P)"],
      ["(I) Source Two", "Encode Two (B)"],
    ]);
    expect(grid.rows[0][0]).toEqual({
      full: "https://i.slow.pics/source.png",
      width: 1920,
      height: 1080,
    });
  });

  test("rejects malformed and uneven grids", () => {
    const malformed = collection();
    malformed.comparisons[1].images.pop();
    expect(() => slowPicsCollectionToGrid(malformed)).toThrow("same column count");

    const invalidName = collection();
    invalidName.comparisons[0].images[0].publicFileName = "../escape.png";
    expect(() => slowPicsCollectionToGrid(invalidName)).toThrow("malformed image metadata");
  });
});
