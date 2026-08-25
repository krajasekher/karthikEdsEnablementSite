// Inline DOM helpers — replaces dom-helpers.js dependency
function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => element.setAttribute(key, val));
  children.forEach((child) => {
    if (typeof child === 'string') element.textContent = child;
    else if (child) element.append(child);
  });
  return element;
}
const div = (attrs, ...children) => el('div', attrs, ...children);
const btn = (attrs) => el('button', attrs);
const imgEl = (attrs) => el('img', attrs);

function createModal(images, startIndex) {
  let slideshowInterval = null;

  const modal = div(
    { class: 'image-modal-overlay' },
    div(
      { class: 'image-modal-content' },
      div(
        { class: 'modal-main' },
        div(
          { class: 'image-container' },
          imgEl({ src: images[startIndex].src, alt: images[startIndex].alt }),
          btn({ class: 'nav-button prev', 'aria-label': 'Previous' }),
          btn({ class: 'nav-button next', 'aria-label': 'Next' }),
          btn({ class: 'expand-button', 'aria-label': 'Expand' }),
        ),
        div(
          { class: 'thumbnails-container' },
          btn({ class: 'thumb-nav prev', 'aria-label': 'Scroll thumbnails left' }),
          div({ class: 'thumbnails-wrapper' }),
          btn({ class: 'thumb-nav next', 'aria-label': 'Scroll thumbnails right' }),
        ),
        div(
          { class: 'modal-controls' },
          div(
            { class: 'slideshow-controls' },
            btn({ class: 'play-button', 'aria-label': 'Play slideshow' }),
            btn({ class: 'slide-nav prev', 'aria-label': 'Previous slide' }),
            btn({ class: 'slide-nav next', 'aria-label': 'Next slide' }),
          ),
          div({ class: 'image-counter' }),
          div({ class: 'modal-title' }),
          btn({ class: 'close-button', 'aria-label': 'Close' }),
        ),
      ),
    ),
  );

  // Populate thumbnails
  const thumbsWrapper = modal.querySelector('.thumbnails-wrapper');
  images.forEach((imgData, idx) => {
    const thumb = div({ class: `thumbnail${idx === startIndex ? ' active' : ''}`, 'data-index': idx });
    thumb.append(imgEl({ src: imgData.src, alt: imgData.alt }));
    thumbsWrapper.append(thumb);
  });

  const mainPrevButton = modal.querySelector('.nav-button.prev');
  const mainNextButton = modal.querySelector('.nav-button.next');
  const modalImage = modal.querySelector('.image-container > img');
  const imageCounter = modal.querySelector('.image-counter');
  const modalTitle = modal.querySelector('.modal-title');
  const thumbnails = modal.querySelectorAll('.thumbnail');
  let currentIndex = startIndex;

  function updateCounter() {
    imageCounter.textContent = `${currentIndex + 1}/${images.length}`;
  }

  function updateModalImage() {
    modalImage.src = images[currentIndex].src;
    modalImage.alt = images[currentIndex].alt;
    modalTitle.textContent = images[currentIndex].getAttribute('data-display') || '';
    updateCounter();

    thumbnails.forEach((thumb, idx) => {
      const isActive = idx === currentIndex;
      thumb.classList.toggle('active', isActive);
      if (isActive) {
        const wrapperRect = thumbsWrapper.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        if (thumbRect.left < wrapperRect.left || thumbRect.right > wrapperRect.right) {
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }

  updateCounter();
  modalTitle.textContent = images[startIndex].getAttribute('data-display') || '';

  thumbnails.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      currentIndex = parseInt(thumb.dataset.index, 10);
      updateModalImage();
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  const closeButton = modal.querySelector('.close-button');
  closeButton.addEventListener('click', () => modal.remove());

  document.addEventListener('keydown', function handleKeydown(e) {
    if (e.key === 'ArrowLeft') {
      mainPrevButton.click();
    } else if (e.key === 'ArrowRight') {
      mainNextButton.click();
    } else if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleKeydown);
    }
  });

  mainPrevButton.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateModalImage();
  });

  mainNextButton.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
    updateModalImage();
  });

  const thumbPrevButton = modal.querySelector('.thumb-nav.prev');
  const thumbNextButton = modal.querySelector('.thumb-nav.next');

  thumbPrevButton.addEventListener('click', (e) => {
    e.stopPropagation();
    thumbsWrapper.scrollBy({ left: -200, behavior: 'smooth' });
  });

  thumbNextButton.addEventListener('click', (e) => {
    e.stopPropagation();
    thumbsWrapper.scrollBy({ left: 200, behavior: 'smooth' });
  });

  const slideNavPrev = modal.querySelector('.slide-nav.prev');
  const slideNavNext = modal.querySelector('.slide-nav.next');

  slideNavPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateModalImage();
  });

  slideNavNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
    updateModalImage();
  });

  const playButton = modal.querySelector('.play-button');

  function stopSlideshow() {
    playButton.classList.remove('playing');
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
    }
  }

  function startSlideshow() {
    playButton.classList.add('playing');
    slideshowInterval = setInterval(() => {
      mainNextButton.click();
    }, 3000);
  }

  playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (slideshowInterval) stopSlideshow();
    else startSlideshow();
  });

  [mainPrevButton, mainNextButton, slideNavPrev, slideNavNext, ...thumbnails].forEach((element) => {
    element.addEventListener('click', (e) => {
      if (slideshowInterval && e.isTrusted) stopSlideshow();
    });
  });

  document.body.appendChild(modal);

  const imageContainer = modal.querySelector('.image-container');
  imageContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-button')) return;
    const rect = imageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) mainPrevButton.click();
    else mainNextButton.click();
  });

  const expandButton = modal.querySelector('.expand-button');
  let isExpanded = false;

  expandButton.addEventListener('click', (e) => {
    e.stopPropagation();
    isExpanded = !isExpanded;
    const modalContent = modal.querySelector('.image-modal-content');
    const modalMain = modal.querySelector('.modal-main');
    expandButton.classList.toggle('contracted', isExpanded);
    modalContent.classList.toggle('expanded', isExpanded);
    modalMain.classList.toggle('expanded', isExpanded);
  });
}

export default function decorate(block) {
  const images = [];
  [...block.children].forEach((row) => {
    const image = row.querySelector('img');
    if (!image) return;
    const caption = row.querySelector('p');
    image.setAttribute('data-display', caption?.textContent.trim() || '');
    image.setAttribute('alt', caption?.textContent.trim() || image.src.split('/').pop().split('.')[0]);
    images.push(image);
  });

  const galleryGrid = div({ class: 'photo-grid' });

  images.forEach((image, index) => {
    const photoItem = div({ class: 'photo-item' });
    photoItem.append(image.cloneNode(true));
    const hoverCircle = div({ class: 'hover-circle' });
    photoItem.append(hoverCircle);
    galleryGrid.appendChild(photoItem);

    photoItem.addEventListener('click', () => {
      createModal(images, index);
    });
  });

  block.textContent = '';
  block.appendChild(galleryGrid);
}
