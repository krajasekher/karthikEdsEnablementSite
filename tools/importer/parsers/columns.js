/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns.
 * Base block: columns
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Columns is a flexible block: the second row holds one cell per visual column.
 * Source structure: a `.grid-layout` whose direct-child divs each become a column.
 * Here the first column is text (heading + subheading + button group) and the
 * second column is a stack of cover images.
 */
export default function parse(element, { document }) {
  // The block element may be the grid-layout itself, or a wrapper containing it.
  const grid = element.matches('.grid-layout')
    ? element
    : element.querySelector('.grid-layout');
  const container = grid || element;

  // Each direct child of the grid is a visual column.
  let columnEls = Array.from(container.querySelectorAll(':scope > div'));

  // Fallback: if no direct-child divs, treat the whole element as a single column.
  if (columnEls.length === 0) {
    columnEls = [container];
  }

  const columnCells = columnEls.map((col) => {
    const contents = Array.from(col.childNodes).filter((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) return true;
      // keep non-empty text nodes
      return node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0;
    });
    return contents.length === 1 ? contents[0] : contents;
  });

  // Empty-block guard
  if (columnCells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [columnCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
