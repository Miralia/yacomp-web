import type { GridCell } from "./types";

/** Split a row-major collection at its final complete row. The caller decides
 *  how to surface the trailing remainder (usually as a separate gallery). */
export function partitionTrailingRemainder<T>(
  items: readonly T[],
  columns: number,
): { complete: T[]; remainder: T[] } {
  if (!Number.isInteger(columns) || columns < 1) {
    return { complete: [], remainder: [...items] };
  }
  const remainderCount = items.length % columns;
  const splitAt = items.length - remainderCount;
  return {
    complete: items.slice(0, splitAt),
    remainder: items.slice(splitAt),
  };
}

/** Automatic comparisons may split a remainder only at an authored boundary.
 *  Inline links/formatting, whitespace, and comments do not divide an image
 *  run. Keep an indivisible run together and let its final viewer row be short.
 *  Explicit/manual selections still use partitionTrailingRemainder directly. */
export function partitionImageRun(
  cells: readonly GridCell[],
  columns: number,
): { comparison: GridCell[]; remainder: GridCell[] } {
  const { complete, remainder } = partitionTrailingRemainder(cells, columns);
  const left = complete[complete.length - 1]?.img;
  const right = remainder[0]?.img;
  if (left?.ownerDocument && left.ownerDocument === right?.ownerDocument) {
    const position = left.compareDocumentPosition(right);
    if (!(position & Node.DOCUMENT_POSITION_DISCONNECTED) && (position & Node.DOCUMENT_POSITION_FOLLOWING)) {
      const range = left.ownerDocument.createRange();
      range.setStartAfter(left);
      range.setEndBefore(right);
      const between = range.cloneContents();
      between.querySelectorAll("script, style").forEach((node) => node.remove());
      const boundary = between.querySelector("br, hr, div, p, pre, table, tbody, thead, tfoot, tr, td, th, ul, ol, li, dl, dt, dd, figure, figcaption, blockquote, section, article, header, footer, h1, h2, h3, h4, h5, h6");
      if (!boundary && !(between.textContent || "").trim()) {
        return { comparison: [...cells], remainder: [] };
      }
    }
  }
  return { comparison: complete, remainder };
}
