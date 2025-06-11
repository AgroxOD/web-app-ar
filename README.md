# Шаблон AR веб-приложения

**Современный шаблон AR-веб-приложения на MindAR.js и Three.js с деплоем на GitHub Pages и перспективой CRM-интеграции.**

[MindAR Example](https://agroxod.github.io/web-app-ar/)

---

## 🚀 Описание

Легковесное веб-приложение для marker-based дополненной реальности (AR), построенное на MindAR.js, Three.js и Vite.  
В проекте заложена поддержка расширения через CRM и MongoDB для сбора статистики, лидогенерации и хранения 3D-моделей.

---

## Требования

- Node.js 18–20 (Node.js 22 не поддерживается)
- pnpm ≥9 (репозиторий использует `pnpm-lock.yaml` вместо `package-lock.json`)

## 🛠️ Технологии

- [Vite](https://vitejs.dev/) — быстрый сборщик
- [Three.js](https://threejs.org/) — 3D-графика в браузере
- [MindAR.js](https://hiukim.github.io/mind-ar-js-doc/) — AR SDK для маркеров
- [pnpm](https://pnpm.io/) — менеджер пакетов
- [Tailwind CSS](https://tailwindcss.com/) — utility‑first CSS
- [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/) — онлайн-конвертер PNG/JPG в `.mind`
- [Express](https://expressjs.com/) — API-сервер
- [Vitest](https://vitest.dev/) — тестовый фреймворк
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
├── server.js           # API сервер на Express
├── tests/              # тесты Vitest
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
# скопируй пример конфигурации и заполни значения
cp .env.example .env
# при необходимости скачай тяжелые модели
sh public/assets/download_models.sh
# пример для Cloudflare R2
# MODEL_URL=https://<account>.r2.cloudflarestorage.com/<bucket>/model.glb sh public/assets/download_models.sh
pnpm dev
pnpm lint # проверка стиля (требует предварительного pnpm install)
pnpm test  # запуск тестов
pnpm format # автоформатирование
pnpm build # production сборка
pnpm preview # предпросмотр dist/
pnpm start  # запуск API-сервера (опционально)
```

Этот проект использует **pnpm** как менеджер пакетов. В репозитории хранится `pnpm-lock.yaml`; файл `package-lock.json` не используется.
В `.gitattributes` прописано `pnpm-lock.yaml merge=ours`, поэтому при слияниях предпочтение отдаётся локальному lockfile.

Открой [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) в браузере и нажми кнопку **Start AR**, чтобы загрузить сцену.

Скопируй `.env.example` в `.env` и заполни нужные переменные: `JWT_SECRET` для подписи токенов, `VITE_ANALYTICS_ENDPOINT` для отправки аналитики и т.д.
Для загрузки моделей из внешнего хранилища можно использовать переменную `VITE_MODEL_URL`.

> **Важно:** приложение должно обслуживаться веб-сервером. Запускай его через `pnpm dev` или статический сервер. Простое открытие `dist/index.html` напрямую в браузере не сработает.

---

## 📝 Публикация на GitHub Pages

1. Проверь базовый путь и целевой стандарт в `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/web-app-ar/', // имя репозитория
     build: { target: 'esnext' }, // поддержка top-level await
     plugins: [
       /* ... */
     ],
   });
   ```
   > ⚠️ Значение `base` должно совпадать с названием репозитория на GitHub.
   > Обязательно укажите `build.target = 'esnext'`, иначе топ-левел `await` не
   > будет работать на GitHub Pages.
2. Сборка и деплой:
   ```bash
   pnpm build
   ```

# Затем залей содержимое папки dist/ в ветку gh-pages (см. AGENTS.md для подробностей)

# После push может потребоваться удалить отслеживаемые файлы, созданные при deploy, иначе переключение на main может завершиться ошибкой

# Используй `git clean -fdx` или вернись на основную ветку командой `git checkout -f main`

# (это помогает избежать ошибки "would be overwritten by checkout")

3. Рекомендуется автоматизировать деплой через GitHub Actions.

---

## 🚢 Развёртывание на Render.com

1. Зарегистрируйся на <https://dashboard.render.com/> и создай **Web Service**.
2. Подключи репозиторий `AgroxOD/web-app-ar` с GitHub.
3. Настрой параметры сборки:
   ```bash
   Build Command: pnpm install
   Start Command: node server.js
   ```
   Root Directory оставь пустым, если `server.js` находится в корне проекта.
4. Добавь переменные окружения из `.env.example`:
   - `MONGODB_URI` – строка подключения к MongoDB Atlas
   - `JWT_SECRET` – секретная фраза для подписи JWT
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
   - `R2_ENDPOINT`, `R2_BUCKET`
   - `JWT_SECRET` – секрет для подписи JWT
   - `FRONTEND_ORIGINS` – список разрешённых доменов для CORS
   - `PORT` – укажи `10000` (Render запускает приложение на этом порту)
5. Сохрани настройки и запусти деплой. После успешного билда сервис будет доступен по адресу вида `https://<name>.onrender.com`.

## 👩‍💻 Разработка

- PNG-маркеры хранятся в `public/`
- Каждый маркер требует свой `.mind`-файл. Его можно сгенерировать через онлайн-компилятор [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/). Помести полученный файл в `public/` рядом с маркером.
- Основная логика находится в `src/ar-scene.js`, ассеты загружаются из `public/`
- Тяжёлые `.glb` модели не хранятся в репозитории. Скачай их скриптом `public/assets/download_models.sh` или укажи `VITE_MODEL_URL`.
- AR-сцену запускает функция `startAR()`, остановка — через `stopAR()`
- Рекомендуемые расширения VS Code: ESLint, Prettier, Vite
- Для проверки кода и автоформатирования используй:

### Настройка MongoDB

1. Скопируй `.env.example` в `.env` и задай переменные `MONGODB_URI` и `JWT_SECRET`.
   - Linux/macOS:
     ```bash
     export MONGODB_URI="mongodb://localhost:27017/ar"
     export JWT_SECRET="mysecret"
     ```
   - Windows PowerShell:
     ```powershell
     $env:MONGODB_URI="mongodb://localhost:27017/ar"
     $env:JWT_SECRET="mysecret"
     ```
2. Создай базу `ar` и коллекцию `models` через `mongosh`:
   ```bash
   mongosh
   > use ar
   > db.createCollection("models")
   > db.models.insertOne({ name: "demo", url: "model.glb" })
   ```
3. (Опционально) запусти сервер:
   ```bash
   pnpm api
   ```

# или

pnpm start

````

### Сервер API

- Файл `server.js` запускает API на Express с MongoDB
- Модели доступны по `GET /api/models`
- Запусти сервер командой `pnpm api` или `pnpm start`, если нужен собственный API
- Для загрузки моделей используется Cloudflare R2 (S3 API)
- Примеры роутов:
- `POST /upload` — загружает файл `model` в бакет
- `GET /model/:filename` — выдаёт временную ссылку на модель
- `POST /auth/register` — регистрация пользователя
- `POST /auth/login` — получение JWT
- перед запуском задайте переменные `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `R2_ENDPOINT`, `R2_BUCKET` и `JWT_SECRET`

> `JWT_SECRET` является обязательной переменной; если она не указана, защищённые маршруты API вернут статус `500`.

Пример конфигурации `.env`:

```env
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=yyyy
AWS_REGION=auto
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_BUCKET=my-bucket
JWT_SECRET=super-secret
````

#### Аутентификация

1. Укажи `JWT_SECRET` в `.env` — ключ подписи JWT.
2. Регистрация: `POST /auth/register` с JSON `{username, email, password}`.
3. Вход: `POST /auth/login` — в ответ `{ jwt }`.
4. Защищённые роуты требуют `Authorization: Bearer <jwt>`.

Создайте бакет в панели Cloudflare R2 и укажите его имя в `R2_BUCKET`.

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
- [x] Tailwind CSS
- [ ] Интеграция с MongoDB
- [ ] Cloudflare R2
- [ ] Готовая к продакшену CRM
- [ ] Аналитика и логи по маркерам

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
