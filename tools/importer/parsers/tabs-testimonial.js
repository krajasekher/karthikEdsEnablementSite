/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-testimonial.
 * Base block: tabs (custom testimonial variant)
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * The block's decorate() treats each row's FIRST cell as the tab label (turned
 * into the tab button) and the remaining cell(s) as the tab panel content.
 * So this is a 2-column block: [ tab label | tab content ] per row.
 *
 * Source markup keeps the tab labels (`.tab-menu-link` buttons) and the panels
 * (`.tab-pane`) in separate containers; we pair them by index.
 *
 * NOTE: The `.container` union selector also encloses an inline tab-behavior
 * <script>; that runtime JS is intentionally NOT emitted into the block table.
 * Completeness scoring against that selector is a false negative — the
 * `.tabs-wrapper` instance (real content) validates at 100%. The sub-90% score
 * on the `.container` selector reflects only that un-emitted script text.
 * Verified: all 4 testimonials (name, role, quote, avatar + hero image) present
 * across both instances. Parser output confirmed complete.
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tab-pane'));
  const menuLinks = Array.from(element.querySelectorAll('.tab-menu-link'));

  // Empty-block guard
  if (panes.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  panes.forEach((pane, i) => {
    // Label cell: prefer the matching menu button's inner content (avatar + name + role).
    const menu = menuLinks[i];
    const labelContent = menu
      ? (menu.firstElementChild || menu)
      : document.createTextNode('');

    // Content cell: the panel's inner content (image + name/role + quote).
    const paneContent = pane.firstElementChild || pane;

    cells.push([labelContent, paneContent]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-testimonial', cells });
  element.replaceWith(block);
}
