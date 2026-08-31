/* eslint-disable */
/* global WebImporter */

/**
 * Nav import: builds the EDS header nav document (/nav) from the source site's
 * top .navbar. Produces the standard 3-section structure the header block
 * expects: brand | sections (ul>li, nested ul => dropdown) | tools.
 *
 * Section links are pointed at the migrated EDS page paths (already relative on
 * the source). Trends mega-menu and Support dropdown become nested <ul>s so the
 * header decorator marks them as .nav-drop dropdowns. Tools = Subscribe CTA.
 */

// Top-level nav model derived from the source header (short titles for the
// mega-menu items; taglines dropped for a clean menu).
const NAV = {
  brand: { text: 'Fashion Blog', href: '/' },
  sections: [
    {
      label: 'Trends',
      children: [
        { text: 'Streetwear', href: '/fashion-trends-young-adults-casual-sport' },
        { text: 'Sporty', href: '/fashion-trends-young-adults-casual-sport' },
        { text: 'Party', href: '/fashion-trends-young-adults-casual-sport' },
        { text: 'Tennis', href: '/fashion-trends-young-adults' },
        { text: 'Beach', href: '/fashion-trends-young-adults' },
        { text: 'Festival', href: '/fashion-trends-young-adults' },
        { text: 'Style Files', href: '/blog' },
        { text: 'Blog Watch', href: '/blog' },
        { text: 'How To', href: '/blog' },
      ],
    },
    { label: 'About', href: '/fashion-trends-of-the-season' },
    { label: 'Blog', href: '/blog' },
    {
      label: 'Support',
      children: [
        { text: 'Contact', href: '/faq' },
        { text: 'FAQ', href: '/faq' },
      ],
    },
  ],
  tools: [{ text: 'Subscribe', href: '/' }],
};

export default {
  transform: (payload) => {
    const { document } = payload;

    const root = document.createElement('div');
    // Section separator: md/da renders each <hr> as a new top-level section
    // <div>, which the header block maps to brand / sections / tools by order.
    const sep = () => root.append(document.createElement('hr'));

    // --- Section 1: brand ---
    const brandP = document.createElement('p');
    const brandA = document.createElement('a');
    brandA.href = NAV.brand.href;
    brandA.textContent = NAV.brand.text;
    brandP.append(brandA);
    root.append(brandP);

    sep();

    // --- Section 2: sections (top-level ul; nested ul => dropdown) ---
    const ul = document.createElement('ul');
    NAV.sections.forEach((item) => {
      const li = document.createElement('li');
      if (item.href) {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        li.append(a);
      } else {
        // dropdown parent: label as text, children in nested ul
        li.append(document.createTextNode(item.label));
        const subUl = document.createElement('ul');
        (item.children || []).forEach((child) => {
          const subLi = document.createElement('li');
          const a = document.createElement('a');
          a.href = child.href;
          a.textContent = child.text;
          subLi.append(a);
          subUl.append(subLi);
        });
        li.append(subUl);
      }
      ul.append(li);
    });
    root.append(ul);

    sep();

    // --- Section 3: tools (CTA) ---
    NAV.tools.forEach((tool) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = tool.href;
      a.textContent = tool.text;
      p.append(a);
      root.append(p);
    });

    return [{
      element: root,
      path: '/nav',
      report: { title: 'nav', sections: NAV.sections.length },
    }];
  },
};
