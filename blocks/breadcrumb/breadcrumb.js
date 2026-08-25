import { getMetadata } from '../../scripts/aem.js';

/**
 * Builds a breadcrumb trail from the current page's URL path.
 * @param {HTMLElement} $block The main element
 */
export default function decorate($block) {
  const title = getMetadata('og:title');
  const $ul = document.createElement('ul');
  $block.append($ul);

  // Build the trail from the URL path instead of hardcoding it.
  const path = window.location.pathname; // e.g. "/guides/setup/intro"
  const segments = path.split('/').filter((s) => s); // ["guides","setup","intro"]

  const trail = [{ text: 'Home', link: '/' }];

  segments.forEach((segment, i) => {
    const link = `/${segments.slice(0, i + 1).join('/')}`;
    const isLast = i === segments.length - 1;
    trail.push({
      // Prettify the slug ("banner-test" -> "Banner Test"); use the page title for the last crumb.
      text: isLast ? title : segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      link: isLast ? undefined : link, // current page isn't a link
    });
  });

  while (trail.length) {
    const step = trail.shift();
    const $li = document.createElement('li');
    $ul.append($li);
    let $wrap = $li;
    if (step.link) {
      $wrap = document.createElement('a');
      $wrap.href = step.link;
      $li.append($wrap);
    }
    const $span = document.createElement('span');
    $wrap.append($span);
    $span.textContent = step.text;
  }
}
