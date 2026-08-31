/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters site-wide cleanup.
 *
 * All selectors verified against migration-work/cleaned.html.
 *
 * Non-authorable site shell to remove:
 *  - a.skip-link            : "Skip to main content" accessibility link (body > first child)
 *  - .navbar                : top navigation shell (logo, nav-menu, mega-menu, mobile toggle)
 *  - footer.footer          : global site footer (logo, social icons, footer nav columns)
 *
 * ⚠️ Do NOT remove a bare `header` — on the landing-page template the hero
 * section (rc1) is authored as `<header class="section secondary-section">`
 * INSIDE #main-content and is authorable content. Only the site-shell
 * selectors above are removed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // No cookie banners / modals / overlays present in captured DOM.
    // Nothing blocks block parsing before parsers run.

    // Flatten the article-body spec sheet into default content. On the source
    // page it is a key/value <table> (header "Spec | Detail"); WebImporter would
    // otherwise emit it as a block whose first cell ("Spec") becomes a block
    // name that EDS tries to load and 404s. Convert each body row to a paragraph
    // "<strong>label</strong>: value". Handles both the raw <table> and any
    // pre-converted div.spec structure.
    const flattenRows = (rowEls, cellSel) => {
      const frag = document.createElement('div');
      rowEls.forEach((row) => {
        const cells = row.querySelectorAll(cellSel);
        if (cells.length === 0) return;
        const p = document.createElement('p');
        if (cells.length >= 2) {
          const strong = document.createElement('strong');
          strong.textContent = cells[0].textContent.trim();
          p.append(strong, document.createTextNode(`: ${cells[1].textContent.trim()}`));
        } else {
          p.textContent = row.textContent.trim();
        }
        frag.append(p);
      });
      return frag;
    };

    element.querySelectorAll('table').forEach((table) => {
      const headText = (table.querySelector('th, thead td') || {}).textContent || '';
      if (!/spec/i.test(headText)) return; // only the spec sheet, never generic tables
      const bodyRows = [...table.querySelectorAll('tr')].filter((tr) => !tr.querySelector('th'));
      const frag = flattenRows(bodyRows, 'td');
      table.replaceWith(...frag.childNodes);
    });

    element.querySelectorAll('.spec').forEach((spec) => {
      const frag = flattenRows([...spec.querySelectorAll(':scope > div')], ':scope > div');
      spec.replaceWith(...frag.childNodes);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome (selectors from captured DOM).
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      '.navbar',
      'footer.footer',
    ]);
  }
}
