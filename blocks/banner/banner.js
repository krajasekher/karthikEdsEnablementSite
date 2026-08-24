import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Row 1: image
  const imageRow = rows[0];
  const picture = imageRow?.querySelector('picture');

  // Row 2: title text
  const titleRow = rows[1];
  const titleText = titleRow?.textContent?.trim() || '';

  // Row 3: optional background color — defaults to brand blue
  const colorRow = rows[2];
  const bgColor = colorRow?.textContent?.trim() || '#0b6ce1';

  // Apply background color to the block
  block.style.backgroundColor = bgColor;

  // Optimize the picture element
  let optimizedPicture = null;
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      optimizedPicture = createOptimizedPicture(img.src, img.alt || titleText, false, [{ width: '1200' }]);
    }
  }

  // Build the title content overlay
  const contentDiv = document.createElement('div');
  contentDiv.className = 'banner-content';
  const heading = document.createElement('h2');
  heading.textContent = titleText;
  contentDiv.append(heading);

  // Reassemble block with picture + content
  block.innerHTML = '';
  if (optimizedPicture) block.append(optimizedPicture);
  block.append(contentDiv);
}
