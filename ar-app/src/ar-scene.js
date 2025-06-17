// Основная сцена AR. Загружает модели и управляет событиями MindAR
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { logEvent } from './utils/analytics.js';
import { showControls, hideControls } from './utils/ui.js';

let mindarThreeInstance;
let lightInterval;
// Canvas для оценки яркости кадра сохраняется на уровне модуля,
// чтобы корректно очищаться при остановке AR
let lumCanvas;

export const modelParams = {
  rotationY: 0,
  scale: 1,
};

// Управление цветом рамки
function setFrameColor(color) {
  const frame = document.getElementById('ar-frame');
  if (frame) frame.style.borderColor = color;
}

const toggleFrame = (on) => {
  const f = document.getElementById('ar-frame');
  if (f) f.style.display = on ? 'block' : 'none';
};

// Инициализация AR-сцены при загрузке страницы
export const startAR = async (modelsList) => {
  if (!navigator.mediaDevices?.getUserMedia || !window.WebGLRenderingContext) {
    alert('Ваш браузер не поддерживает AR');
    return false;
  }
  logEvent('sessionStart');
  if (!modelsList || modelsList.length === 0) {
    const fallback = import.meta.env.VITE_MODEL_URL;
    if (fallback) modelsList = [{ url: fallback, markerIndex: 0 }];
  }
  const base = import.meta.env.BASE_URL;
  const mindarThree = new MindARThree({
    container: document.querySelector('#ar-container'),
    imageTargetSrc: `${base}target.mind`,
    filterMinCF: 0.0001,
    filterBeta: 0.01,
    missTolerance: 10,
  });

  mindarThreeInstance = mindarThree;

  const { renderer, scene, camera } = mindarThree;
  if ('outputColorSpace' in renderer)
    renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Основные константы для настройки освещения и модели
  const LIGHT_INTENSITY = 1; // при необходимости измените яркость света
  const FALLBACK_MODEL_SCALE = 0.5; // масштаб по умолчанию, если объём модели не вычислен

  // Базовое освещение сцены
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, LIGHT_INTENSITY);
  scene.add(light);

  // Загрузка модели. Приоритет: параметр ?model=URL, затем VITE_MODEL_URL
  const loader = new GLTFLoader();
  const unique = {};
  (modelsList || []).forEach((m) => {
    if (unique[m.markerIndex] === undefined) unique[m.markerIndex] = m;
  });
  const anchors = [];
  try {
    for (const info of Object.values(unique)) {
      const gltf = await loader.loadAsync(info.url);
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const desired = 1;
      let scale = FALLBACK_MODEL_SCALE;
      if (Number.isFinite(maxDim) && maxDim > 0) {
        scale = desired / maxDim;
      }
      model.scale.setScalar(scale);
      const anchor = mindarThree.addAnchor(info.markerIndex ?? 0);
      anchor.group.add(model);
      anchor.group.visible = false;
      anchor.onTargetFound = () => {
        anchor.group.visible = true;
        toggleFrame(false);
        showControls();
        setFrameColor('green');
        logEvent('targetFound');
      };
      anchor.onTargetLost = () => {
        anchor.group.visible = false;
        toggleFrame(true);
        hideControls();
        setFrameColor('white');
        logEvent('targetLost');
      };
      anchors.push({ anchor, model });
    }
  } catch (e) {
    console.error(e);
    alert('Ошибка загрузки 3D-модели!');
    logEvent('modelError', { message: e?.message });
    return false;
  }

  try {
    await mindarThree.start();
    toggleFrame(true);
    setFrameColor('white');
    // Создаём скрытый canvas для оценки яркости кадра
    const video = mindarThree.video;
    lumCanvas = document.createElement('canvas');
    lumCanvas.width = video.videoWidth;
    lumCanvas.height = video.videoHeight;
    lumCanvas.style.display = 'none';
    document.body.appendChild(lumCanvas);
    const lumCtx = lumCanvas.getContext('2d');

    const minIntensity = 0.5;
    const maxIntensity = 1.5;

    const updateLight = () => {
      lumCtx.drawImage(video, 0, 0, lumCanvas.width, lumCanvas.height);
      const { data } = lumCtx.getImageData(
        0,
        0,
        lumCanvas.width,
        lumCanvas.height,
      );
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      }
      const avg = sum / (data.length / 4) / 255;
      light.intensity = THREE.MathUtils.lerp(minIntensity, maxIntensity, avg);
    };

    lightInterval = setInterval(updateLight, 500);
  } catch (e) {
    console.error(e);
    alert(
      'Не удалось инициализировать камеру. Проверьте разрешения и перезагрузите страницу.',
    );
    logEvent('sessionError', { message: e?.message });
    return false;
  }
  renderer.setAnimationLoop(() => {
    anchors.forEach(({ model }) => {
      model.rotation.y = THREE.MathUtils.degToRad(modelParams.rotationY);
      model.scale.setScalar(modelParams.scale);
    });
    renderer.render(scene, camera);
  });
  return true;
};

export const stopAR = () => {
  if (lightInterval) {
    clearInterval(lightInterval);
    lightInterval = undefined;
  }
  if (mindarThreeInstance) {
    mindarThreeInstance.stop();
    mindarThreeInstance = undefined;
  }
  if (lumCanvas) {
    lumCanvas.remove();
    lumCanvas = undefined;
  }
};
