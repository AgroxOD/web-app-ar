import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import './styles/mindar-image-three.prod.css';
import { logEvent } from './utils/analytics.js';
import { showControls, hideControls } from './utils/ui.js';

// Параметры сглаживания движения модели
export const smoothingParams = {
  positionLerp: 0.2,
  rotationLerp: 0.2,
  scaleLerp: 0.2,
};

// Управление цветом рамки
function setFrameColor(color) {
  const frame = document.getElementById('ar-frame');
  if (frame) frame.style.borderColor = color;
}

function showFrame() {
  const frame = document.getElementById('ar-frame');
  if (frame) frame.style.display = 'block';
}

function hideFrame() {
  const frame = document.getElementById('ar-frame');
  if (frame) frame.style.display = 'none';
}

// Инициализация AR-сцены при загрузке страницы
export const startAR = async () => {
  if (!navigator.mediaDevices?.getUserMedia || !window.WebGLRenderingContext) {
    alert('Ваш браузер не поддерживает AR');
    return false;
  }
  logEvent('sessionStart');
  const base = import.meta.env.BASE_URL;
  const mindarThree = new MindARThree({
    container: document.querySelector('#ar-container'),
    imageTargetSrc: `${base}target.mind`,
    filterMinCF: 0.0001,
    filterBeta: 0.01,
    missTolerance: 10,
  });

  const { renderer, scene, camera } = mindarThree;
  if ('outputColorSpace' in renderer)
    renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Основные константы для настройки освещения и модели
  const LIGHT_INTENSITY = 1; // при необходимости измените яркость света
  const FALLBACK_MODEL_SCALE = 0.5; // масштаб по умолчанию, если объём модели не вычислен

  // Базовое освещение сцены
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, LIGHT_INTENSITY);
  scene.add(light);

  // Загрузка модели
  const loader = new GLTFLoader();
  let model;
  try {
    const gltf = await loader.loadAsync(`${base}assets/model.glb`);
    model = gltf.scene;

    // Подгоняем масштаб модели по bounding box, если возможно
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    const desired = 1; // целевой размер в условных единицах сцены
    let scale = FALLBACK_MODEL_SCALE;
    if (Number.isFinite(maxDim) && maxDim > 0) {
      scale = desired / maxDim;
    }

    model.scale.setScalar(scale);
  } catch (e) {
    alert('Ошибка загрузки 3D-модели!');
    logEvent('modelError', { message: e?.message });
    return false;
  }

  // Группа-обёртка для плавного следования за якорем
  const wrapper = new THREE.Group();
  wrapper.add(model);
  scene.add(wrapper);
  wrapper.visible = false;

  // Управление камерой
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;

  // Якорь для маркера
  const anchor = mindarThree.addAnchor(0);

  anchor.onTargetFound = () => {
    anchor.group.getWorldPosition(targetPosition);
    anchor.group.getWorldQuaternion(targetQuaternion);
    anchor.group.getWorldScale(targetScale);

    wrapper.position.copy(targetPosition);
    wrapper.quaternion.copy(targetQuaternion);
    wrapper.scale.copy(targetScale);

    wrapper.visible = true;
    hideFrame();
    showControls();
    setFrameColor('green');
    logEvent('targetFound');
  };
  anchor.onTargetLost = () => {
    wrapper.visible = false;
    showFrame();
    hideControls();
    setFrameColor('white');
    logEvent('targetLost');
  };

  // Плавное следование за якорем
  const targetPosition = new THREE.Vector3();
  const targetQuaternion = new THREE.Quaternion();
  const targetScale = new THREE.Vector3();
  anchor.onTargetUpdate = () => {
    anchor.group.getWorldPosition(targetPosition);
    anchor.group.getWorldQuaternion(targetQuaternion);
    anchor.group.getWorldScale(targetScale);

    wrapper.position.lerp(targetPosition, smoothingParams.positionLerp);
    wrapper.quaternion.slerp(targetQuaternion, smoothingParams.rotationLerp);
    wrapper.scale.lerp(targetScale, smoothingParams.scaleLerp);
  };

  try {
    await mindarThree.start();
    showFrame();
    setFrameColor('white');
    // Создаём скрытый canvas для оценки яркости кадра
    const video = mindarThree.video;
    const lumCanvas = document.createElement('canvas');
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

    setInterval(updateLight, 500);
  } catch (e) {
    alert(
      'Не удалось инициализировать камеру. Проверьте разрешения и перезагрузите страницу.',
    );
    logEvent('sessionError', { message: e?.message });
    return false;
  }
  renderer.setAnimationLoop(() => {
    controls.target.copy(wrapper.position);
    controls.update();
    renderer.render(scene, camera);
  });
  return true;
};
