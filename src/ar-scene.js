import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import '../public/mindar-image-three.prod.css';

// Управление цветом рамки
function setFrameColor(color) {
  const frame = document.getElementById('ar-frame');
  if (frame) frame.style.borderColor = color;
}

// Инициализируем AR-сцену сразу, скрипт подключается в конце body,
// поэтому событие DOMContentLoaded уже отработало
const init = async () => {
  const base = import.meta.env.BASE_URL;
  const mindarThree = new MindARThree({
    container: document.querySelector('#ar-container'),
    imageTargetSrc: `${base}target.mind`,
  });

  const { renderer, scene, camera } = mindarThree;
  if ('outputColorSpace' in renderer)
    renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Загрузка модели
  const loader = new GLTFLoader();
  let model;
  try {
    const gltf = await loader.loadAsync(`${base}assets/model.glb`);
    model = gltf.scene;
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
    setFrameColor('limegreen');
  };
  anchor.onTargetLost = () => {
    model.visible = false;
    setFrameColor('white');
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

init();
