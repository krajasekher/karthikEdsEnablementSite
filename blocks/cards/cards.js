import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  /* build the category-pill + date meta row from the leading paragraph */
  ul.querySelectorAll('.cards-card-body').forEach((body) => {
    const meta = body.querySelector('p');
    if (!meta) return;
    const text = meta.textContent.trim();
    // date pattern trailing: "May 12", "June 3", "Dec. 24"
    const dateMatch = text.match(/\s+([A-Z][a-z]{2,8}\.?\s+\d{1,2})\s*$/);
    meta.classList.add('cards-card-meta');
    meta.textContent = '';
    if (dateMatch) {
      const category = text.slice(0, dateMatch.index).trim();
      const date = dateMatch[1].trim();
      if (category) {
        const cat = document.createElement('span');
        cat.className = 'cards-card-category';
        cat.textContent = category;
        meta.append(cat);
      }
      const d = document.createElement('span');
      d.className = 'cards-card-date';
      d.textContent = date;
      meta.append(d);
    } else {
      const cat = document.createElement('span');
      cat.className = 'cards-card-category';
      cat.textContent = text;
      meta.append(cat);
    }
  });

  block.replaceChildren(ul);
}
