/* eslint-disable */
/* global WebImporter */
/**
 * Parser for photo-gallery.
 * Base block: photo-gallery (custom — no library convention)
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * The block's decorate() iterates over block rows; each row holds one image and
 * an optional caption <p>. So this parser emits one single-cell row per image.
 * Selector targets the image grid (`.grid-layout:last-of-type`); the section
 * heading/intro live outside this element and are handled as default content.
 */
export default function parse(element, { document }) {
  // Collect every image within the gallery grid.
  const images = Array.from(element.querySelectorAll('img'));

  // Empty-block guard
  if (images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = images.map((img) => {
    // Preserve an accompanying caption if one exists alongside the image.
    const cell = [img];
    const caption = img.closest('div')?.querySelector('p');
    if (caption) cell.push(caption);
    return [cell.length === 1 ? cell[0] : cell];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'photo-gallery', cells });
  element.replaceWith(block);
}
