/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards.
 * Base block: cards
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Cards is a 2-column block: [ image | text content ] per row (one row per card).
 * Source cards are `<a class="article-card">` wrapping an image div and a body
 * div (meta tags/date + heading). The card is entirely a link, so we preserve
 * the href as a CTA anchor at the bottom of the text cell.
 */
export default function parse(element, { document }) {
  // Card containers vary by page: article cards (.article-card) on the blog/home
  // index, and trend cards (a.trend-card / a.card-link) on the gallery page.
  // Prefer known card classes anywhere in the grid (handles an extra wrapper div
  // some pages place between the grid and its cards); only fall back to direct
  // children when no known card class is present.
  let cards = Array.from(element.querySelectorAll('.article-card, .trend-card, a.card-link'))
    .filter((el) => el.querySelector('img'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll(':scope > a, :scope > div'))
      .filter((el) => el.querySelector('img'));
  }

  // Empty-block guard
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build the text cell from FRESH, clean elements (rather than moving the
  // source nodes). The source markup carries framework attributes (inline
  // `style` with CSS custom properties, Astro `data-*` hashes) and nested
  // wrappers that break the importer's markdown table serialization — it
  // collapses a multi-row block down to a single row. Reconstructing minimal
  // <p>/<h3>/<a> nodes with plain text/href avoids that.
  const headingTag = (el) => (el && el.tagName && /^H[1-6]$/.test(el.tagName)
    ? el.tagName.toLowerCase() : 'h3');

  const cells = [];
  cards.forEach((card) => {
    const srcImg = card.querySelector('img');
    const body = card.querySelector('.article-card-body, .trend-card-body') || card;

    const textContent = [];

    // Category tag / meta as a plain paragraph.
    const meta = body.querySelector('.article-card-meta');
    const tag = body.querySelector(':scope > .tag, :scope > span.tag');
    if (meta || tag) {
      const p = document.createElement('p');
      p.textContent = (meta || tag).textContent.replace(/\s+/g, ' ').trim();
      textContent.push(p);
    }

    // Heading, wrapped in the card's link so the href is retained.
    const srcHeading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const href = card.getAttribute('href')
      || (card.querySelector('a') && card.querySelector('a').getAttribute('href'));
    if (srcHeading) {
      const h = document.createElement(headingTag(srcHeading));
      const title = srcHeading.textContent.replace(/\s+/g, ' ').trim();
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h.append(a);
      } else {
        h.textContent = title;
      }
      textContent.push(h);
    }

    // Description paragraph(s) — present on trend cards, absent on index cards.
    body.querySelectorAll(':scope > p').forEach((srcP) => {
      const text = srcP.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        textContent.push(p);
      }
    });

    let imageCell = '';
    if (srcImg) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      if (srcImg.getAttribute('alt')) img.alt = srcImg.getAttribute('alt');
      imageCell = img;
    }
    const textCell = textContent.length ? textContent : '';
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
