# AGENTS.md

## Проект: AR-веб-приложение с поддержкой MindAR.js, GitHub Pages и CRM-интеграцией

### Описание
Этот проект представляет собой AR-веб-приложение, построенное с использованием технологий **MindAR.js**, **Three.js**, **Vite**, **pnpm** и разворачиваемое на **GitHub Pages**. Проект изначально ориентирован на работу с PNG-маркерами и может быть расширен для интеграции с CRM-системой, использующей **MongoDB** в качестве базы данных.

---

## Технологии

- **Vite** — современный сборщик для быстрой разработки и билда
- **Three.js** — 3D-графика в браузере
- **MindAR.js** (mindar-image) — AR SDK с поддержкой marker-based трекинга
- **pnpm** — быстрый и эффективный менеджер пакетов
- **mindar-cli** — CLI-утилита для генерации `.mind` таргетов из PNG
- **Visual Studio Code** — основная IDE
- *(в перспективе)* **MongoDB** — для хранения пользовательских данных, логов, CRM-метаданных

---

## Структура проекта

```
project-root/
├── public/
│   ├── marker.png         # PNG изображение маркера
│   ├── target.mind        # Сгенерированный файл таргета
│   └── assets/            # Прочие ассеты
├── src/
│   ├── main.js            # Точка входа
│   ├── ar-scene.js        # Инициализация AR
│   └── utils/             # Вспомогательные функции
├── index.html
├── vite.config.js
└── package.json
```

---

## Инструкция по разработке

### 1. Инициализация

```bash
pnpm create vite
cd <project-name>
pnpm install
```

### 2. Установка зависимостей

```bash
pnpm add three
pnpm add mind-ar
pnpm dlx mindar-cli convert -i public/marker.png -o public/target.mind
```

### 3. Запуск проекта

```bash
pnpm dev
```

Открыть в браузере: [http://localhost:5173](http://localhost:5173)

---

## Инструкция по публикации на GitHub Pages

1. В `vite.config.js` указать:

```js
export default defineConfig({
  base: "/web-app-ar/",
  plugins: [ ... ]
});
```

2. Выполнить сборку:

```bash
pnpm build
```

3. Залить содержимое папки `dist/` в ветку `main`.

---

## VS Code Setup

- Открыть проект в Visual Studio Code
- Установить расширения:
  - ESLint
  - Prettier
  - Vite
- Настроить форматирование, автосохранение и hot reload
- Работать через встроенный терминал (`pnpm dev`)

---

## Расширение: Подключение CRM и MongoDB

> Поддержка будет добавлена в отдельных агентах.

- API-интеграция с MongoDB Atlas или self-hosted MongoDB
- Ведение логов взаимодействия пользователя с маркером
- Привязка данных к каждому target marker (например, статистика, аналитика, контактные формы)
- Использование cloud-хранилищ (например, Cloudflare R2) для хранения `.glb`-моделей

---

## Статус

✅ Локальная разработка  
✅ Совместимость с GitHub Pages  
🔄 В разработке: CRM-интеграция с MongoDB