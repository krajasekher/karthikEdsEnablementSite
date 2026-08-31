/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import photoGalleryParser from './parsers/photo-gallery.js';
import tabsTestimonialParser from './parsers/tabs-testimonial.js';
import cardsParser from './parsers/cards.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import heroParser from './parsers/hero.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  columns: columnsParser,
  'photo-gallery': photoGalleryParser,
  'tabs-testimonial': tabsTestimonialParser,
  cards: cardsParser,
  'accordion-faq': accordionFaqParser,
  hero: heroParser,
};

// TRANSFORMER REGISTRY (cleanup first, then section breaks/metadata)
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Rich landing/marketing page: hero banner followed by multiple stacked content and feature sections',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
  ],
  blocks: [
    { name: 'section-rc1', instances: ['#main-content > header.section.secondary-section'], section: 'secondary' },
    { name: 'section-rc2', instances: ['#main-content > section.section:nth-of-type(1)'] },
    { name: 'section-rc3', instances: ['#main-content > section.section.secondary-section:nth-of-type(2)'], section: 'secondary' },
    { name: 'section-rc4', instances: ['#main-content > section.section:nth-of-type(3)'] },
    { name: 'section-rc5', instances: ['#main-content > section.section.secondary-section:nth-of-type(4)'], section: 'secondary' },
    { name: 'section-rc6', instances: ['#main-content > section.section:nth-of-type(5)'] },
    { name: 'section-rc7', instances: ['#main-content > section.section.inverse-section'], section: 'dark' },
    { name: 'columns', instances: ['#main-content > header.section.secondary-section > .container > .grid-layout', '#main-content > section.section:nth-of-type(1) > .container > .grid-layout'] },
    { name: 'photo-gallery', instances: ['#main-content > section.section.secondary-section:nth-of-type(2) > .container > .grid-layout:last-of-type'] },
    { name: 'tabs-testimonial', instances: ['#main-content > section.section:nth-of-type(3) .tabs-wrapper'] },
    { name: 'cards', instances: ['#main-content > section.section.secondary-section:nth-of-type(4) > .container > .grid-layout:last-of-type'] },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(5) > .container > .grid-layout'] },
    { name: 'hero', instances: ['#main-content > section.section.inverse-section > .container'] },
  ],
};

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    // section-* entries drive section metadata (handled by the section transformer), not parsers
    if (blockDef.name.startsWith('section-')) return;
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
