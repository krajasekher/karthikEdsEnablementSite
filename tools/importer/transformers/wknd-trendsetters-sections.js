/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters section breaks + section metadata.
 *
 * The landing-page template has 7 stacked sections under #main-content
 * (see migration-work/page-structure.json). Each non-first section gets a
 * leading <hr> break; sections with an explicit style get a Section Metadata
 * block.
 *
 * Section styles come from tools/importer/page-templates.json (section-rc*):
 *   rc1 secondary  #main-content > header.section.secondary-section
 *   rc2 (default)  #main-content > section.section:nth-of-type(1)
 *   rc3 secondary  #main-content > section.section.secondary-section:nth-of-type(2)
 *   rc4 (default)  #main-content > section.section:nth-of-type(3)
 *   rc5 secondary  #main-content > section.section.secondary-section:nth-of-type(4)
 *   rc6 (default)  #main-content > section.section:nth-of-type(5)
 *   rc7 dark       #main-content > section.section.inverse-section
 *
 * All selectors verified against migration-work/cleaned.html.
 *
 * NOTE: page-templates.json for this `da` project carries section data on the
 * `blocks[]`/`section` fields rather than a `template.sections` array, so the
 * ordered section list is embedded here (DOM-verified selectors + styles).
 *
 * Uses BOTH hooks: block parsers run between beforeTransform and afterTransform
 * and replace section elements (many sections wrap exactly one block), so <hr>
 * markers are inserted in beforeTransform while every section element still
 * exists, and Section Metadata is anchored to those markers in afterTransform.
 * Sections are processed in reverse so live-element inserts never shift the
 * position of sections not yet handled.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

const SECTIONS = [
  { id: 'rc1', selector: '#main-content > header.section.secondary-section', style: 'secondary' },
  { id: 'rc2', selector: '#main-content > section.section:nth-of-type(1)' },
  { id: 'rc3', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'secondary' },
  { id: 'rc4', selector: '#main-content > section.section:nth-of-type(3)' },
  { id: 'rc5', selector: '#main-content > section.section.secondary-section:nth-of-type(4)', style: 'secondary' },
  { id: 'rc6', selector: '#main-content > section.section:nth-of-type(5)' },
  { id: 'rc7', selector: '#main-content > section.section.inverse-section', style: 'dark' },
];

/**
 * Derive the ordered section list from the import script's PAGE_TEMPLATE when
 * available (section-rc* block entries carry selector + style), so this single
 * transformer works for every WKND template. Falls back to the embedded
 * landing-page SECTIONS list when no template is supplied.
 */
function resolveSections(payload) {
  const tmpl = payload && payload.template;
  if (tmpl && Array.isArray(tmpl.blocks)) {
    const derived = tmpl.blocks
      .filter((b) => typeof b.name === 'string' && b.name.startsWith('section-'))
      .map((b) => ({
        id: b.name.replace(/^section-/, ''),
        selector: b.instances[0],
        style: b.section,
      }));
    if (derived.length) return derived;
  }
  return SECTIONS;
}

export default function transform(hookName, element, payload) {
  const sections = resolveSections(payload);

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section: no leading break and no marker needed (it has no style).
      if (i === 0 && !section.style) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers may have replaced section elements. Anchor each styled section's
    // Section Metadata block to whichever still exists: the marker <hr> placed
    // above, or (no marker inserted) the original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
