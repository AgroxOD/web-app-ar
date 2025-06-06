# AR Web App Template

**Современный шаблон AR-веб-приложения на MindAR.js и Three.js с деплоем на GitHub Pages и перспективой CRM-интеграции.**

![MindAR Example](https://hiukim.github.io/mind-ar-js-doc/img/screenshot-1.jpg)

---

## 🚀 Описание

Легковесное веб-приложение для marker-based дополненной реальности (AR), построенное на MindAR.js, Three.js и Vite.  
В проекте заложена поддержка расширения через CRM и MongoDB для сбора статистики, лидогенерации и хранения 3D-моделей.

---

## 🛠️ Технологии

- [Vite](https://vitejs.dev/) — быстрый сборщик
- [Three.js](https://threejs.org/) — 3D-графика в браузере
- [MindAR.js](https://hiukim.github.io/mind-ar-js-doc/) — AR SDK для маркеров
- [pnpm](https://pnpm.io/) — менеджер пакетов
- [mindar-cli](https://github.com/hiukim/mind-ar-js/tree/main/packages/mindar-cli) — генерация `.mind` файлов из PNG-маркеров
- *(опционально)* [MongoDB Atlas](https://www.mongodb.com/atlas), [Cloudflare R2](https://www.cloudflare.com/products/r2/)

---

## 📦 Структура

```
project-root/
├── public/
│   ├── marker.png
│   ├── target.mind
│   └── assets/
├── src/
│   ├── ar-scene.js
│   └── utils/
├── index.html
├── vite.config.js
└── package.json
```

---

## ⚡ Быстрый старт

```bash
git clone <repo-url>
cd <project-name>
pnpm install
pnpm dev
```

Этот проект использует **pnpm** как менеджер пакетов. В репозитории хранится `pnpm-lock.yaml`; файл `package-lock.json` не используется.

Открой [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) в браузере.

> **Важно:** приложение должно обслуживаться веб-сервером. Запускай его через `pnpm dev` или статический сервер. Простое открытие `dist/index.html` напрямую в браузере не сработает.

---

## 📝 Публикация на GitHub Pages

1. Проверь базовый путь в `vite.config.js`:
    ```js
    export default defineConfig({
      base: "/<repo-name>/",
      plugins: [/* ... */]
    });
    ```
2. Сборка и деплой:
    ```bash
    pnpm build
    # Затем залей содержимое папки dist/ в ветку gh-pages (см. AGENTS.md для подробностей)
    ```
3. Рекомендуется автоматизировать деплой через GitHub Actions.

---

## 👩‍💻 Разработка

- PNG-маркеры хранятся в `public/`
- Каждый маркер требует свой `.mind`-файл (генерируй через mindar-cli)
- Основная логика находится в `src/ar-scene.js`, ассеты загружаются из `public/`
- Рекомендуемые расширения VS Code: ESLint, Prettier, Vite

---

## 🧩 Расширение: CRM и MongoDB (roadmap)

- Интеграция с MongoDB Atlas для хранения статистики и лидов
- Cloudflare R2 — для хранения `.glb` моделей
- Аналитика взаимодействия с маркерами

---

## ✅ Статус

- [x] Локальная разработка  
- [x] GitHub Pages  
- [ ] Интеграция с MongoDB  
- [ ] Cloudflare R2  
- [ ] Production-ready CRM

---

## 📚 Полезные ссылки

- [Документация MindAR.js](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js Docs](https://threejs.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)

---

> Подробнее см. в [AGENTS.md](./AGENTS.md)
