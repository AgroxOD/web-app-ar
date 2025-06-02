<script>
  import { onMount } from 'svelte';

  // Подключаем стили
  import '@assets/styles.css';



  // Логика камеры и трекинга маркера
  import '@logic/camera-ar-core.js';
  const base = import.meta.env.BASE_URL;
  const markerUrl = `${base}markers_patt/pattern-AGROmarkerWB.patt`;
  const modelUrl = `${base}models/000001.glb`;

</script>

<!-- Контейнер для радиального меню -->
<div
  id="radial-menu-container"
  style="position: absolute; top: 0; left: 0; z-index: 5; pointer-events: none;"
></div>

<!-- AR-сцена (A-Frame + AR.js) -->
<main style="width: 100vw; height: 100vh; margin: 0; overflow: hidden">
<a-scene
  embedded
  arjs="sourceType: webcam; debugUIEnabled: true; detectionMode: mono_and_matrix;"
  vr-mode-ui="enabled: false"
  renderer="logarithmicDepthBuffer: true"
>
    <!-- Маркер -->
    <a-marker
      id="marker-root"
      type="pattern"
      url={markerUrl}
    >
      <!-- Модель (по умолчанию скрыта, показывается при markerFound) -->
      <a-entity
        id="model-entity"
        gltf-model={modelUrl}
        scale="0.5 0.5 0.5"
        rotation="0 0 0"
        position="0 0 0"
        visible="false"
      ></a-entity>
    </a-marker>

    <!-- Камера -->
    <a-entity camera></a-entity>
  </a-scene>
</main>
