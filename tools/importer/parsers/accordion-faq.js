/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Accordion is a 2-column block: [ title | content ] per row (one row per item).
 * Source items are `<details class="faq-item">` with a `<summary>` (question,
 * plus a decorative +/- icon) and a `.faq-answer` body. We use the question text
 * as the title cell and the answer body as the content cell. The decorative icon
 * is intentionally dropped (the block renders its own toggle affordance).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('details.faq-item, details'));

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const summary = item.querySelector('summary, .faq-question');
    // Prefer the question text span; fall back to summary text.
    const titleEl = summary ? (summary.querySelector('span') || summary) : null;
    const title = titleEl ? titleEl.textContent.trim() : '';

    const answer = item.querySelector('.faq-answer') || item.querySelector('div:not(.faq-question)');
    const content = answer || document.createTextNode('');

    cells.push([title, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
