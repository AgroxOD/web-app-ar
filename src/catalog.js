import { loadModels as fetchModels } from './utils/models.js';

async function loadCatalog() {
  const list = await fetchModels();
  render(list);
}

function render(list) {
  const container = $('#catalog-container');
  container.empty();
  const query = ($('#search').val() || '').toLowerCase();
  list
    .filter((m) => m.name.toLowerCase().includes(query))
    .forEach((m) => {
      const card = $(
        `<div class="col-md-3 grid-margin stretch-card"><div class="card"><div class="card-body"><h4 class="card-title">${m.name}</h4><button class="btn btn-sm btn-outline-primary preview" data-id="${m._id}">Preview</button></div></div></div>`,
      );
      container.append(card);
    });
}

$('#search').on('input', loadCatalog);

$('#catalog-container').on('click', '.preview', function () {
  const id = $(this).data('id');
  window.open(`../index.html?id=${id}`, '_blank');
});

loadCatalog();
