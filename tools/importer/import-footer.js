/* eslint-disable */
/* global WebImporter */

/**
 * Footer import: builds the EDS footer document (/footer) from the source site's
 * contentinfo footer. The footer block renders the fragment content as-is, so
 * this produces the footer layout directly: a brand row, then three link
 * columns (Trends / Inspire / Explore), then the social links.
 *
 * Source column links point to "#" placeholders on the origin; preserved as-is.
 * Sections are separated by <hr> so md/da emits distinct top-level section divs.
 */

const FOOTER = {
  brand: { text: 'Fashion Blog', href: '/' },
  columns: [
    {
      heading: 'Trends',
      links: [
        { text: 'Style', href: '#' },
        { text: 'Looks', href: '#' },
        { text: 'Events', href: '#' },
        { text: 'Brands', href: '#' },
        { text: 'Tips', href: '#' },
      ],
    },
    {
      heading: 'Inspire',
      links: [
        { text: 'Stories', href: '#' },
        { text: 'People', href: '#' },
        { text: 'Culture', href: '#' },
        { text: 'Vibes', href: '#' },
        { text: 'Fun', href: '#' },
      ],
    },
    {
      heading: 'Explore',
      links: [
        { text: 'Travel', href: '#' },
        { text: 'Beach', href: '#' },
        { text: 'Night', href: '#' },
        { text: 'Sport', href: '#' },
        { text: 'Chill', href: '#' },
      ],
    },
  ],
  social: [
    { text: 'Facebook', href: '#' },
    { text: 'Instagram', href: '#' },
    { text: 'X', href: '#' },
    { text: 'LinkedIn', href: '#' },
    { text: 'YouTube', href: '#' },
  ],
};

export default {
  transform: (payload) => {
    const { document } = payload;

    const root = document.createElement('div');
    const sep = () => root.append(document.createElement('hr'));

    // --- Section 1: brand ---
    const brandP = document.createElement('p');
    const brandA = document.createElement('a');
    brandA.href = FOOTER.brand.href;
    brandA.textContent = FOOTER.brand.text;
    brandP.append(brandA);
    root.append(brandP);

    // --- Section 2: link columns (Trends / Inspire / Explore) ---
    FOOTER.columns.forEach((col) => {
      sep();
      const h = document.createElement('h2');
      h.textContent = col.heading;
      root.append(h);
      const ul = document.createElement('ul');
      col.links.forEach((link) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        li.append(a);
        ul.append(li);
      });
      root.append(ul);
    });

    // --- Section 3: social links ---
    sep();
    const socialP = document.createElement('p');
    FOOTER.social.forEach((s, i) => {
      const a = document.createElement('a');
      a.href = s.href;
      a.textContent = s.text;
      socialP.append(a);
      if (i < FOOTER.social.length - 1) socialP.append(document.createTextNode(' '));
    });
    root.append(socialP);

    return [{
      element: root,
      path: '/footer',
      report: { title: 'footer', columns: FOOTER.columns.length },
    }];
  },
};
