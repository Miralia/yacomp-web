import { setupKeyboard } from "./keyboard";
import { openSettings as openSettingsPanel, setWebSettingsMode } from "./ui/settings";
import { openWithDummyWrapper, type ViewerHandle } from "./viewer";
import type { Grid, GridCell } from "./grid";

export interface SlowPicsImage {
  name: string;
  publicFileName: string;
  width?: number | null;
  height?: number | null;
}

export interface SlowPicsComparison {
  key?: string;
  name?: string;
  images: SlowPicsImage[];
}

export interface SlowPicsCollection {
  key?: string;
  name?: string;
  comparisons: SlowPicsComparison[];
  [key: string]: unknown;
}

export interface OpenSlowPicsOptions {
  onClose?: () => void;
}

let initialized = false;

function initializeWebViewer(): void {
  setWebSettingsMode();
  if (initialized) return;
  setupKeyboard();
  initialized = true;
}

function displayName(name: string): string {
  return name.replaceAll(".", " ");
}

function validateCollection(collection: SlowPicsCollection): void {
  if (!collection || !Array.isArray(collection.comparisons) || !collection.comparisons.length) {
    throw new TypeError("Invalid slow.pics collection: comparisons are required");
  }

  const numCols = collection.comparisons[0]?.images?.length ?? 0;
  if (!numCols) throw new TypeError("Invalid slow.pics collection: images are required");

  for (const comparison of collection.comparisons) {
    if (!Array.isArray(comparison.images) || comparison.images.length !== numCols) {
      throw new TypeError("Invalid slow.pics collection: every row must have the same column count");
    }
    for (const image of comparison.images) {
      if (!image?.name || !/^[A-Za-z0-9._-]+$/.test(image.publicFileName || "")) {
        throw new TypeError("Invalid slow.pics collection: malformed image metadata");
      }
    }
  }
}

export function slowPicsCollectionToGrid(collection: SlowPicsCollection): Grid {
  validateCollection(collection);

  const comparisons = collection.comparisons;
  const names = comparisons[0].images.map((image) =>
    displayName(image.name.replace(/^\([BIP]\) /, ""))
  );
  const rows: GridCell[][] = comparisons.map((comparison) =>
    comparison.images.map((image) => ({
      full: `https://i.slow.pics/${image.publicFileName}`,
      width: image.width,
      height: image.height,
    }))
  );

  return {
    rows,
    numCols: names.length,
    names,
    rowNames: comparisons.map((comparison) =>
      comparison.images.map((image) => displayName(image.name))
    ),
    initialZoom: { mode: "fit" },
  };
}

export function openSlowPicsCollection(
  collection: SlowPicsCollection,
  options: OpenSlowPicsOptions = {},
): ViewerHandle {
  const grid = slowPicsCollectionToGrid(collection);
  initializeWebViewer();
  return openWithDummyWrapper(grid, options.onClose);
}

export function openSettings(): void {
  initializeWebViewer();
  openSettingsPanel();
}

export type { ViewerHandle };
