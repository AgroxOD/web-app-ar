// src/logic/ar-object-controls.js

// ---- 1. Константы ----
const CONTROL_OBJECT_ID = 'model-entity';

const MENU_RADIUS = 155;
// Minimal distance from the center for a click to be registered.
// Clicks inside this radius are ignored to provide an "inactive" zone
// around the central button of the radial menu.
const MENU_INNER_RADIUS = 78;
const SECTORS_COUNT = 8;
const sectorIconSize = 65;
const centerIconSize = 30;
const sectorOpacity = 0.82;
const centerOpacity = 0.82;

const ICONS = [
  'icons/1.png',
  'icons/2.png',
  'icons/3.png',
  'icons/4.png',
  'icons/5.png',
  'icons/6.png',
  'icons/7.png',
  'icons/8.png'
];

// Utility to get the controlled 3D object
function getModel() {
  return document.getElementById(CONTROL_OBJECT_ID);
}

// ---- 2a. Actions over the AR object ----

function rotateY(delta) {
  const model = getModel();
  if (!model) return;
  const rot = model.getAttribute('rotation');
  const y = (rot.y || 0) + delta;
  model.setAttribute('rotation', `${rot.x} ${y} ${rot.z}`);
}

function scaleModel(factor) {
  const model = getModel();
  if (!model) return;
  const scale = model.getAttribute('scale');
  const sx = (scale.x || 1) * factor;
  const sy = (scale.y || 1) * factor;
  const sz = (scale.z || 1) * factor;
  model.setAttribute('scale', `${sx} ${sy} ${sz}`);
}

function toggleModel() {
  const model = getModel();
  if (!model) return;
  const current = parseInt(model.dataset.modelIndex || '0', 10);
  const next = (current + 1) % 2; // simple toggle between two states
  if (next === 0) {
    model.removeAttribute('geometry');
    model.setAttribute('gltf-model', 'models/000001.glb');
  } else {
    model.removeAttribute('gltf-model');
    model.setAttribute('geometry', 'primitive: box; depth: 1; height: 1; width: 1');
  }
  model.dataset.modelIndex = String(next);
}

function changeColor() {
  const model = getModel();
  if (!model) return;
  const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  model.setAttribute('material', 'color', color);
}

function toggleVisibility() {
  const model = getModel();
  if (!model) return;
  const visible = model.getAttribute('visible');
  model.setAttribute('visible', visible === true || visible === 'true' ? 'false' : 'true');
}

function resetTransform() {
  const model = getModel();
  if (!model) return;
  model.setAttribute('rotation', '0 0 0');
  model.setAttribute('scale', '0.5 0.5 0.5');
}

// ---- 2. Вспомогательные функции ----

function getRadialMenuSVG() {
  let sectorsSVG = '';
  for (let i = 0; i < SECTORS_COUNT; i++) {
    const angle = (2 * Math.PI * i) / SECTORS_COUNT;
    const x = MENU_RADIUS + MENU_RADIUS * Math.cos(angle - Math.PI / 2);
    const y = MENU_RADIUS + MENU_RADIUS * Math.sin(angle - Math.PI / 2);

    sectorsSVG += `
      <g>
        <circle
          cx="${x}"
          cy="${y}"
          r="${sectorIconSize / 2}"
          fill="#40456b"
          opacity="${sectorOpacity}"
          data-sector="${i}"
        />
        <image
          xlink:href="${ICONS[i]}"
          x="${x - sectorIconSize / 2}"
          y="${y - sectorIconSize / 2}"
          width="${sectorIconSize}"
          height="${sectorIconSize}"
          pointer-events="none"
        />
      </g>
    `;
  }

  // Центральная кнопка (пример)
  const center = MENU_RADIUS;
  let centerSVG = `
    <circle
      cx="${center}"
      cy="${center}"
      r="${centerIconSize}"
      fill="#30334e"
      opacity="${centerOpacity}"
    />
    <image
      xlink:href="icons/plus.png"
      x="${center - centerIconSize / 2}"
      y="${center - centerIconSize / 2}"
      width="${centerIconSize}"
      height="${centerIconSize}"
      pointer-events="none"
    />
  `;

  return `
    <svg
      id="radial-menu-svg"
      width="${MENU_RADIUS * 2}"
      height="${MENU_RADIUS * 2}"
      viewBox="0 0 ${MENU_RADIUS * 2} ${MENU_RADIUS * 2}"
      style="touch-action: none; user-select: none;"
    >
      ${sectorsSVG}
      ${centerSVG}
    </svg>
  `;
}

function handleMenuClick(e) {
  const svg = e.currentTarget;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());

  const center = MENU_RADIUS;
  const dx = cursorpt.x - center;
  const dy = cursorpt.y - center;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Ignore clicks too close to the center
  if (distance < MENU_INNER_RADIUS) {
    return;
  }

  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  let sector = Math.floor(((angle + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI / SECTORS_COUNT));
  if (sector < 0 || sector >= SECTORS_COUNT) sector = 0;

  // Пример обработки клика — можно добавить свою логику
  console.log(`Клик по сектору #${sector + 1}`);
  const actions = [
    () => rotateY(-15),     // sector 1
    () => rotateY(15),      // sector 2
    () => scaleModel(1.1),  // sector 3
    () => scaleModel(0.9),  // sector 4
    () => toggleModel(),    // sector 5
    () => changeColor(),    // sector 6
    () => toggleVisibility(), // sector 7
    () => resetTransform()  // sector 8
  ];

  const action = actions[sector];
  if (action) action();
}

// ---- 3. Основная функция отрисовки ----

function renderRadialMenu() {
  let container = document.getElementById('radial-menu-container');
  if (!container) {
    // Если контейнер еще не появился — пробуем снова чуть позже
    setTimeout(renderRadialMenu, 100);
    return;
  }
  container.innerHTML = getRadialMenuSVG();

  const svg = document.getElementById('radial-menu-svg');
  if (svg) {
    svg.addEventListener('pointerdown', handleMenuClick);
    svg.addEventListener('touchstart', handleMenuClick);
  }
}

// ---- 4. Инициализация ----

function safeInitRadialMenu() {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    renderRadialMenu();
  } else {
    document.addEventListener('DOMContentLoaded', renderRadialMenu);
  }
}

safeInitRadialMenu();
