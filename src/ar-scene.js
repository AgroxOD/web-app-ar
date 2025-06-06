import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import './styles/mindar-image-three.prod.css';

// Управление цветом рамки
function setFrameColor(color) {
  const frame = document.getElementById('ar-frame');
  if (frame) frame.style.borderColor = color;
}

// Инициализация AR-сцены вызывается по нажатию кнопки
export const startAR = async () => {
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
    return;
  }

  // Якорь для маркера, модель видна только по маркеру
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(model);
  model.visible = false;

  anchor.onTargetFound = () => {
    model.visible = true;
  };
  anchor.onTargetLost = () => {
    model.visible = false;
  };

  try {
    await mindarThree.start();
  } catch (e) {
    alert(
      'Не удалось инициализировать камеру. Проверьте разрешения и перезагрузите страницу.',
    );
    return;
  }
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
};
