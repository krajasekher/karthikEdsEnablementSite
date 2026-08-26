const QUERY_INDEX_URL = '/query-index.json';

// Paths to exclude — nav/utility pages that aren't real articles
const EXCLUDED_PREFIXES = ['/nav', '/footer', '/header', '/drafts'];

function isArticle(path) {
  return !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function createCard(article) {
  const card = document.createElement('div');
  card.className = 'article-list-card';

  if (article.image) {
    const picture = document.createElement('div');
    picture.className = 'article-list-card-image';
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title || '';
    img.loading = 'lazy';
    picture.append(img);
    card.append(picture);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  const title = document.createElement('h3');
  const link = document.createElement('a');
  link.href = article.path;
  link.textContent = article.title || article.path;
  title.append(link);
  body.append(title);

  if (article.description) {
    const desc = document.createElement('p');
    desc.textContent = article.description;
    body.append(desc);
  }

  card.append(body);
  return card;
}

export default async function decorate(block) {
  // Show loading state
  block.innerHTML = '<p class="article-list-loading">Loading articles…</p>';

  try {
    const resp = await fetch(QUERY_INDEX_URL);
    if (!resp.ok) throw new Error(`Failed to fetch index: ${resp.status}`);

    const json = await resp.json();
    const articles = (json.data || [])
      .filter((item) => isArticle(item.path))
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

    block.innerHTML = '';

    if (articles.length === 0) {
      block.innerHTML = '<p>No articles found.</p>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'article-list-grid';
    articles.forEach((article) => grid.append(createCard(article)));
    block.append(grid);
  } catch (err) {
    block.innerHTML = '<p class="article-list-error">Could not load articles.</p>';
    // eslint-disable-next-line no-console
    console.error('article-list block error:', err);
  }
}
