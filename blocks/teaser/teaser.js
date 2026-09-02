/**
 * Teaser block: image + title + supporting text + CTA.
 * Content model (one cell per row): image, title, text, cta.
 * Decorates the authored rows into an image wrapper and a text wrapper so the
 * CSS can lay them out; tolerant of missing rows (authors may omit cells).
 */
export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;

    if (cell.querySelector('picture, img')) {
      row.classList.add('teaser-image');
    } else {
      row.classList.add('teaser-content');
      const link = cell.querySelector('a');
      // Treat a row whose only content is a link as the CTA.
      if (link && cell.textContent.trim() === link.textContent.trim()) {
        row.classList.add('teaser-cta');
        link.classList.add('button');
      }
    }
  });
}
