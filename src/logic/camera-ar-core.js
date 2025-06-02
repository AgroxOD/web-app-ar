const MODEL_ID  = 'model-entity';
const MARKER_ID = 'marker-root';

// Ждём, когда Svelte вставит App.svelte в DOM
function setupScene() {
  const scene = document.querySelector('a-scene');
  if (!scene) return;
  scene.addEventListener('loaded', () => {
    setupMarkerEvents();
  });
}

// После того как <a-scene> готов, повесим события на <a-marker>
function setupMarkerEvents() {
  const marker = document.querySelector(`#${MARKER_ID}`);
  if (!marker) return;

  marker.addEventListener('markerFound', () => {
    const model = document.getElementById(MODEL_ID);
    if (model) model.setAttribute('visible', 'true');
  });
  marker.addEventListener('markerLost', () => {
    const model = document.getElementById(MODEL_ID);
    if (model) model.setAttribute('visible', 'false');
  });
}

// Гарантируем, что эта функция запустится после полной загрузки DOM
function initARCamera() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupScene);
  } else {
    setupScene();
  }
}

initARCamera();
