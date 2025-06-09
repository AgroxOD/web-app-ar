# Шаблон AR веб-приложения

**Современный шаблон AR-веб-приложения на MindAR.js и Three.js с деплоем на GitHub Pages и перспективой CRM-интеграции.**

[MindAR Example](https://agroxod.github.io/web-app-ar/)

---

## 🚀 Описание

Легковесное веб-приложение для marker-based дополненной реальности (AR), построенное на MindAR.js, Three.js и Vite.  
В проекте заложена поддержка расширения через CRM и MongoDB для сбора статистики, лидогенерации и хранения 3D-моделей.

---

## Требования

- Node.js ≥18
- pnpm ≥9 (репозиторий использует `pnpm-lock.yaml` вместо `package-lock.json`)

## 🛠️ Технологии

- [Vite](https://vitejs.dev/) — быстрый сборщик
- [Three.js](https://threejs.org/) — 3D-графика в браузере
- [MindAR.js](https://hiukim.github.io/mind-ar-js-doc/) — AR SDK для маркеров
- [pnpm](https://pnpm.io/) — менеджер пакетов
- [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/) — онлайн-конвертер PNG/JPG в `.mind`
- ESLint + Prettier (flat config `eslint.config.js`)
- _(опционально)_ [MongoDB Atlas](https://www.mongodb.com/atlas), [Cloudflare R2](https://www.cloudflare.com/products/r2/)

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
# при необходимости скачай тяжелые модели
sh public/assets/download_models.sh
pnpm dev
pnpm lint # проверка стиля
pnpm format # автоформатирование
```

Этот проект использует **pnpm** как менеджер пакетов. В репозитории хранится `pnpm-lock.yaml`; файл `package-lock.json` не используется.
В `.gitattributes` прописано `pnpm-lock.yaml merge=ours`, поэтому при слияниях предпочтение отдаётся локальному lockfile.

Открой [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) в браузере и нажми кнопку **Start AR**, чтобы загрузить сцену.

Если планируется отправка аналитики, скопируй `.env.example` в `.env` и задай переменную `VITE_ANALYTICS_ENDPOINT` со ссылкой на свой сервер.
Для загрузки моделей из внешнего хранилища можно использовать переменную `VITE_MODEL_URL`.

> **Важно:** приложение должно обслуживаться веб-сервером. Запускай его через `pnpm dev` или статический сервер. Простое открытие `dist/index.html` напрямую в браузере не сработает.

---

## 📝 Публикация на GitHub Pages

1. Проверь базовый путь в `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/web-app-ar/', // имя репозитория
     plugins: [
       /* ... */
     ],
   });
   ```
   > ⚠️ Значение `base` должно совпадать с названием репозитория на GitHub.
2. Сборка и деплой:
   ```bash
   pnpm build
   ```

# Затем залей содержимое папки dist/ в ветку gh-pages (см. AGENTS.md для подробностей)

# После push очисти рабочее дерево командой `git clean -fd`, иначе переключение на main может завершиться ошибкой

3. Рекомендуется автоматизировать деплой через GitHub Actions.

---

## 🚢 Развёртывание на Fly.io

1. Установи `flyctl` с официального сайта: <https://fly.io/docs/flyctl/install/>.
2. Запусти инициализацию:
   ```bash
   flyctl launch
   ```
   При необходимости отредактируй `fly.toml` (app name, port).
3. Задай секреты с переменными окружения:
   ```bash
   flyctl secrets set MONGODB_URI=<url> PORT=<port>
   ```
4. Деплой:
   ```bash
   flyctl deploy
   ```
5. Базовые команды:
   ```bash
   flyctl logs   # логи
   flyctl status # статус приложения
   flyctl open   # открыть в браузере
   ```

## 👩‍💻 Разработка

- PNG-маркеры хранятся в `public/`
- Каждый маркер требует свой `.mind`-файл. Его можно сгенерировать через онлайн-компилятор [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/). Помести полученный файл в `public/` рядом с маркером.
- Основная логика находится в `src/ar-scene.js`, ассеты загружаются из `public/`
- Тяжёлые `.glb` модели не хранятся в репозитории. Скачай их скриптом `public/assets/download_models.sh` или укажи `VITE_MODEL_URL`.
- AR-сцену запускает функция `startAR()`, остановка — через `stopAR()`
- Рекомендуемые расширения VS Code: ESLint, Prettier, Vite
- Для проверки кода и автоформатирования используй:

### Настройка MongoDB

1. Скопируй `.env.example` в `.env` и задай переменную `MONGODB_URI` со строкой подключения к MongoDB.
   - Linux/macOS:
     ```bash
     export MONGODB_URI="mongodb://localhost:27017/ar"
     ```
   - Windows PowerShell:
     ```powershell
     $env:MONGODB_URI="mongodb://localhost:27017/ar"
     ```
2. Создай базу `ar` и коллекцию `models` через `mongosh`:
   ```bash
   mongosh
   > use ar
   > db.createCollection("models")
   > db.models.insertOne({ name: "demo", url: "model.glb" })
   ```
3. Запусти сервер:
   ```bash
   pnpm api
   ```
   После старта страница `public/admin.html` позволит просматривать каталог.

### Сервер API

- Файл `server.js` запускает API на Express с MongoDB
- Модели доступны по `GET /api/models`
- Запусти сервер командой `pnpm api`

```bash
pnpm lint
pnpm format
```

### Обновление локальной ветки

```bash
git checkout main
git fetch origin
git rebase origin/main
pnpm install
```

В `.gitattributes` указано `pnpm-lock.yaml merge=ours`, поэтому при слияниях используется локальный lockfile.
Установи [`@pnpm/merge-lockfile-changes`](https://github.com/pnpm/merge-lockfile-changes) командой `pnpm add -D @pnpm/merge-lockfile-changes`.
При конфликте lockfile выполни `npx @pnpm/merge-lockfile-changes` для автоматического слияния.

### Добавление нового AR-маркера

1. Подготовь изображение маркера в формате PNG или JPG и скопируй его в папку `public/` с уникальным именем.
2. Сгенерируй соответствующий файл `target.mind` через онлайн-конвертер и помести его рядом с изображением.
3. Открой `src/ar-scene.js` и измени значение `imageTargetSrc` на путь к новому `.mind`-файлу. Если используешь несколько маркеров, объедини их в один `.mind` и обнови индексы якорей.
4. При необходимости добавь загрузку 3D‑модели или другого контента для нового маркера.
5. Запусти `pnpm dev` и проверь работу маркера в браузере.

---

## 🧩 Расширение: CRM и MongoDB (дорожная карта)

- Интеграция с MongoDB Atlas для хранения статистики и лидов
- Cloudflare R2 — для хранения `.glb` моделей
- Аналитика взаимодействия с маркерами

---

## ✅ Статус

- [x] Локальная разработка
- [x] GitHub Pages
- [ ] Интеграция с MongoDB
- [ ] Cloudflare R2
- [ ] Готовая к продакшену CRM

---

## ❓ Troubleshooting

- Странице требуется доступ к камере. Если разрешение не выдано, вместо AR-сцены может отображаться чёрный экран.
- В мобильных браузерах запуск AR иногда требует взаимодействия пользователя (например, нажатия на экран).
- Проверяйте ошибки в консоли и вкладке Network браузера.
- Убедитесь, что `target.mind` присутствует и 3D‑модель скачана (`download_models.sh`) либо задайте `VITE_MODEL_URL`.
- Запускайте страницу по HTTPS и предоставляйте доступ к камере.
- При деплое на GitHub Pages проверьте корректность `BASE_URL`.
- Для теста исключите проблемы с моделью, отобразив простую геометрию (например, куб).

---

## 📝 Лицензия

Распространяется по [лицензии MIT](./LICENSE).

## 📚 Полезные ссылки

- [Документация MindAR.js](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js Docs](https://threejs.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)

---

> Подробнее см. в [AGENTS.md](./AGENTS.md)
