# Migration Plan: WKND Trendsetters — one page per template

**Mode:** Template-Based (multi-template loop)
**Source:** 5 templates from catalog/template-catalog.json
**Generated:** 2026-08-31

## Representative pages (one per template)
- landing-page → https://wknd-trendsetters.site/
- content-listing → https://wknd-trendsetters.site/blog
- blog-article → https://wknd-trendsetters.site/blog/ace-pro-court-polo
- faq-page → https://wknd-trendsetters.site/faq
- card-gallery → https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport

## Steps
- [x] 1. Project Setup (type: da)
- [x] 2. Identify Page Templates (5 templates; representative URLs set)
- [x] 3-6. Per template: Page Analysis → Block Mapping → Import Infrastructure → Content Import
  - [x] landing-page → /index (renders, 6 blocks, 92.7%)
  - [x] content-listing → /blog (renders, 2 blocks)
  - [x] blog-article → /blog/ace-pro-court-polo (renders, 98%)
  - [x] faq-page → /faq (renders, accordion + columns)
  - [x] card-gallery → /fashion-trends-young-adults-casual-sport (renders; see Known gaps)

## Known gaps
- card-gallery (`/fashion-trends-young-adults-casual-sport`): the `#trends` cards
  grid imports **1 of 8** trend cards. First card is fully correct (image, tag,
  title, description).
  - Investigated exhaustively (Aug 31): the `cards` parser and the import
    transform are verified correct — against the live DOM, the raw server HTML,
    and an offline `setContent` snapshot (all contain 8 cards), the transform
    emits a clean 9-row / 8-image cards table. The loss occurs **inside the
    vendored helix-importer `WebImporter.html2md` markdown-table serialization**,
    which collapses this page's multi-row cards table when `html2md` invokes the
    transform internally (calling `cfg.transform` externally then serializing
    yields all 8; the real internal path yields 1). Rebuilding the cells from
    fresh, attribute-stripped `<p>/<h3>/<a>` nodes raised the count in isolated
    tests but not in the live importer.
  - Not fixable without editing the vendored `helix-importer.js` (out of scope
    per AGENTS.md "never edit vendored code"). Recommended follow-up: file
    upstream against the importer's md table serializer, or hand-author the
    remaining 7 card rows in the document after import. The page renders; this is
    a single-section content-completeness gap, not an infrastructure defect.

## Artifacts
- .migration/project.json
- tools/importer/page-templates.json (with block mappings)
- tools/importer/parsers/*.js
- tools/importer/transformers/*.js
- tools/importer/import-*.js
- content/*.plain.html
- tools/importer/reports/*
