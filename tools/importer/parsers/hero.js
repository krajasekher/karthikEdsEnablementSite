/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base block: hero
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Hero is a 1-column block with (up to) 3 rows:
 *   Row 1: block name (added by createBlock)
 *   Row 2: background image (optional) — single cell
 *   Row 3: content (title + subheading + CTA) — single cell holding all elements
 * The source overlays the text on the image, so the background img and the
 * card-body content are extracted separately into their own rows.
 */
export default function parse(element, { document }) {
  const bgImage = element.querySelector('img.cover-image, img[class*="overlay"], img');
  const heading = element.querySelector('h1, h2, [class*="heading"]');
  const subheading = element.querySelector('p.subheading, p');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional)
  if (bgImage) cells.push([bgImage]);

  // Row 3: content — one cell holding heading, subheading, and CTA(s)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
