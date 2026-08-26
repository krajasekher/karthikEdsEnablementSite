const PAGE_SIZE = 4;

export default async function decorate(block) {
  // Fetch the published employees sheet as JSON
  const response = await fetch('/employees.json');
  const json = await response.json();
  const employees = json.data;
  let offset = 0;

  block.textContent = '';

  // Build the employee card list
  const list = document.createElement('ul');
  list.className = 'employee-list-items';
  block.append(list);

  // "Load more" button
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'employee-list-load-more';
  loadMoreBtn.textContent = 'Load more';
  block.append(loadMoreBtn);

  function renderBatch() {
    const batch = employees.slice(offset, offset + PAGE_SIZE);
    batch.forEach((employee) => {
      const item = document.createElement('li');
      item.className = 'employee-card';
      item.innerHTML = `
        <h3>${employee.Name}</h3>
        <p class="employee-dept">${employee.Department}</p>
        <p class="employee-meta">${employee.Experience} yrs · ${employee.City}</p>
      `;
      list.append(item);
    });
    offset += PAGE_SIZE;

    // Hide button when all employees are rendered
    if (offset >= employees.length) {
      loadMoreBtn.style.display = 'none';
    }
  }

  // Render first batch on load
  renderBatch();

  loadMoreBtn.addEventListener('click', () => {
    renderBatch();
  });
}
