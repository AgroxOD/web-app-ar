# Шаблон AR веб-приложения

[English README](./README.en.md)

**Современный шаблон AR-веб-приложения на MindAR.js и Three.js с деплоем на GitHub Pages и перспективой CRM-интеграции.**

[MindAR Example](https://agroxod.github.io/web-app-ar/)

---

## Описание

Легковесное веб-приложение для marker-based дополненной реальности (AR), построенное на MindAR.js, Three.js и Vite.  
В проекте заложена поддержка расширения через CRM и MongoDB для сбора статистики, лидогенерации и хранения 3D-моделей.

---

## Требования

- Node.js 18–21 (рекомендуется Node.js 20 LTS; Node.js 22 не поддерживается)
- Скрипт `scripts/check-node.js` проверяет версию перед установкой и при запуске сервера.
- Скрипт `scripts/check-deps.js` напоминает установить зависимости перед `pnpm lint` и `pnpm test`.
- pnpm ≥9 (репозиторий использует `pnpm-lock.yaml` вместо `package-lock.json`)

## Технологии

- [Vite](https://vitejs.dev/) — быстрый сборщик
- [Three.js](https://threejs.org/) — 3D-графика в браузере
- [MindAR.js](https://hiukim.github.io/mind-ar-js-doc/) — AR SDK для маркеров
- [pnpm](https://pnpm.io/) — менеджер пакетов
- [Tailwind CSS](https://tailwindcss.com/) — utility‑first CSS
- [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/) — онлайн-конвертер PNG/JPG в `.mind`
- [Express](https://expressjs.com/) — API-сервер
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) — ограничение числа запросов (в проекте используется минимальная локальная версия из `lib/express-rate-limit`)
- [Vitest](https://vitest.dev/) — тестовый фреймворк
- ESLint + Prettier (flat config `eslint.config.js`)
- _(опционально)_ [MongoDB Atlas](https://www.mongodb.com/atlas), [Cloudflare R2](https://www.cloudflare.com/products/r2/)

---

## Структура

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

## Быстрый старт

```bash
git clone <repo-url>
cd <project-name>
nvm install  # установит Node.js из .nvmrc (проект требует Node.js 18–21)
nvm use       # обязательно выполните, если у вас Node.js 22+
              # (скрипт scripts/check-node.js напомнит версию из .nvmrc)
sh scripts/setup-node.sh # проверит наличие nvm и подходящую версию Node.js
pnpm install
# Выполни эту команду перед запуском `pnpm lint` или `pnpm test`
# скопируй пример конфигурации и заполни значения
cp .env.example .env
# при необходимости скачай тяжелые модели
MODEL_URL=<url> sh public/assets/download_models.sh
# пример для Cloudflare R2
# MODEL_URL=https://<account>.r2.cloudflarestorage.com/<bucket>/model.glb sh public/assets/download_models.sh
pnpm dev
pnpm lint # проверка стиля (требует предварительного pnpm install)
pnpm test  # запуск тестов
# Vitest по умолчанию запускается в среде Node.
# jsdom подключается только для DOM-тестов через директиву
# `@vitest-environment jsdom`.
pnpm format # автоформатирование
pnpm build # production сборка
pnpm preview # предпросмотр dist/
pnpm start  # запуск API-сервера (опционально)
```

> **Важно:** если у вас уже установлен Node.js 22 или новее, выполните
> `nvm use $(cat .nvmrc)` — иначе установка зависимостей может завершиться
> ошибкой.

> Скрипт `setup-node.sh` завершится с подсказкой по установке `nvm`, если менеджер не найден.

Этот проект использует **pnpm** как менеджер пакетов. В репозитории хранится `pnpm-lock.yaml`; файл `package-lock.json` не используется.
В `.gitattributes` прописано `pnpm-lock.yaml merge=ours`, поэтому при слияниях предпочтение отдаётся локальному lockfile.

Открой [http://localhost:5173/web-app-ar/](http://localhost:5173/web-app-ar/) и нажми **Start AR**. Страница камеры показывает только AR-вид и ссылку **CMS**, по которой можно перейти к менеджеру контента.

Скопируй `.env.example` в `.env` и заполни нужные переменные: `JWT_SECRET` для подписи токенов, `VITE_ANALYTICS_ENDPOINT` для отправки аналитики и т.д.
Для загрузки моделей из внешнего хранилища можно использовать переменную `VITE_MODEL_URL`. Если запрос `/api/models` не выполнен или вернул пустой список, сцена загрузит модель из этой переменной (маркер 0).
Для ограничения CORS задай переменную `FRONTEND_ORIGINS` со списком доменов через запятую.

> **Важно:** приложение должно обслуживаться веб-сервером. Запускай его через `pnpm dev` или статический сервер. Простое открытие `dist/index.html` напрямую в браузере не сработает.

---

## Публикация на GitHub Pages

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
   > Можно также указать путь через переменную `VITE_BASE_PATH`, например
   > `VITE_BASE_PATH=/my-repo/ pnpm build`. Если переменная не задана,
   > используется значение по умолчанию `/web-app-ar/`.
2. Укажи URL бэкенда через `VITE_API_BASE_URL`, чтобы страница CMS могла обращаться к API:

   ```bash
   VITE_API_BASE_URL=https://example.com pnpm build
   ```

   Для Windows:

   - `cmd.exe`:
     ```cmd
     set VITE_API_BASE_URL=https://example.com && pnpm build
     ```
   - PowerShell:
     ```powershell
     $env:VITE_API_BASE_URL='https://example.com'; pnpm build
     ```

   Не добавляй суффикс `/api` в конце URL
   Переменная должна содержать только сам адрес без лишнего текста и пробелов.
   Пример правильного значения: `"https://example.com"`.
   Пробелы в начале или конце будут удалены приложением, что может привести к
   провалу тестов.

3. Создай пустой файл `.nojekyll` в корне проекта, чтобы отключить обработку Jekyll на GitHub Pages.

# Затем залей содержимое папки dist/ в ветку gh-pages (см. AGENTS.md для подробностей)

# После push может потребоваться удалить отслеживаемые файлы, созданные при deploy, иначе переключение на main может завершиться ошибкой

# Используй `git clean -fdx` или вернись на основную ветку командой `git checkout -f main`

# (это помогает избежать ошибки "would be overwritten by checkout")

4. Рекомендуется автоматизировать деплой через GitHub Actions.

---

## Развёртывание на Render.com

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
   - `JWT_MISSING_STATUS` – код статуса, если `JWT_SECRET` не задан; некорректные значения приводят к 500

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL` (заканчивается на `/`)

- `FRONTEND_ORIGINS` – список разрешённых доменов для CORS
- `RATE_LIMIT_MAX` – максимальное число запросов за 15 минут (по умолчанию 100)
- `VITE_API_BASE_URL` – base URL for API requests when running or building the CMS/front‑end
- не добавляй `/api`, просто `https://example.com`
- значение должно быть только URL без лишнего текста и пробелов, например
  `"https://example.com"`; пробелы обрезаются приложением и могут привести к
  ошибкам в тестах
- `VITE_BASE_PATH` – базовый путь для GitHub Pages (например, `/web-app-ar/`)
- `PORT` – укажи `10000` (Render запускает приложение на этом порту)

5. Сохрани настройки и запусти деплой. После успешного билда сервис будет доступен по адресу вида `https://<name>.onrender.com`.

### Поддержание активности

Бесплатные сервисы Render "засыпают" через 15 минут без запросов. Чтобы API отвечало быстрее, его можно регулярно пинговать.

#### GitHub Actions

Создай файл `.github/workflows/ping-render.yml` со следующим содержимым:

```yaml
name: Render keep awake
on:
  schedule:
    - cron: '*/14 * * * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: curl -fsS https://web-app-ar-api.onrender.com/api/models
```

Этот workflow отправляет GET-запрос каждые ~14 минут и не даёт сервису уснуть.

#### Внешние сервисы

Вместо GitHub Actions можно использовать внешние cron-решения, например [cron-job.org](https://cron-job.org/) или любой сервис мониторинга (UptimeRobot и т.д.). Достаточно настроить пинг по тому же URL.

## Разработка

- PNG-маркеры хранятся в `public/`
- Каждый маркер требует свой `.mind`-файл. Его можно сгенерировать через онлайн-компилятор [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/). Помести полученный файл в `public/` рядом с маркером.
- Основная логика находится в `src/ar-scene.js`, ассеты загружаются из `public/`
- Тяжёлые `.glb` модели не хранятся в репозитории. Скачай их скриптом `public/assets/download_models.sh`, передав `MODEL_URL=<url>`, или укажи `VITE_MODEL_URL` (она также используется как запасная модель при ошибке API).
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
3. Убедись, что в базе также присутствует коллекция `users`. При запуске API
   функция `validateMongoSchema()` проверит наличие обеих коллекций и остановит
   сервер при их отсутствии.
4. (Опционально) запусти сервер:
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
- `GET /api/me` — данные текущего пользователя
- перед запуском задайте переменные `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (по умолчанию `us-east-1`), `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL` и `JWT_SECRET`

> `JWT_SECRET` является обязательной переменной. Если она не указана, защищённые маршруты API вернут код `500` или значение `JWT_MISSING_STATUS`, если оно представляет собой число.

Пример конфигурации `.env`:

```env
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=yyyy
AWS_REGION=auto
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_BUCKET=my-bucket
R2_PUBLIC_URL=https://pub-<account>.r2.dev/ # важно: слэш в конце
JWT_SECRET=super-secret
JWT_MISSING_STATUS=
FRONTEND_ORIGINS=
RATE_LIMIT_MAX=
````

При изменении `R2_PUBLIC_URL` перезапустите сервер, чтобы обновить URL существующих моделей.

#### Логи при запуске сервера

При старте `server.js` выводятся сообщения о состоянии окружения:

- проверка каталога `public/assets` — если папка отсутствует, она создаётся и
  печатается `✅ [dir] assets directory created`, иначе `ℹ️ [dir] assets directory exists`;
- подтверждение подключения к MongoDB: `✅ [mongo] connected to <host>`;
- тестовая попытка обращения к R2, успешная или с ошибкой
  (`✅ [r2] connection OK` или `❌ [r2] connection error`).

В логах не выводятся значения секретных переменных и паролей.

#### Аутентификация

1. Укажи `JWT_SECRET` в `.env` — ключ подписи JWT.
2. Регистрация: `POST /auth/register` с JSON `{username, email, password, role}`.
   Если `role` не указан, используется `user`.
3. Вход: `POST /auth/login` — в ответ `{ jwt, role }`.
4. Текущий пользователь: `GET /api/me` возвращает `{ id, email, role }` при наличии
   валидного токена.
5. Защищённые роуты требуют `Authorization: Bearer <jwt>`. Админские маршруты
   (`PUT /api/models/:id`, `DELETE /api/models/:id`, `POST /upload`) доступны
   только пользователям с ролью `admin`.
   На эти маршруты также накладывается ограничение скорости
   через `express-rate-limit` (по умолчанию 100 запросов за 15 минут,
   значение можно изменить через `RATE_LIMIT_MAX`).
6. Выданный токен действителен 1 час. После истечения срока понадобится вновь
   выполнить вход.

Создайте бакет в панели Cloudflare R2 и укажите его имя в `R2_BUCKET`.
При инициализации `S3Client` для работы с R2 необходимо передавать опцию
`forcePathStyle: true`.

```bash
pnpm lint
pnpm format
```

Перед выполнением команд `pnpm lint` и `pnpm test` обязательно запусти `pnpm install`.

### CMS / Content Manager

Страница `cms/index.html` служит минимальной CMS для загрузки и редактирования моделей.

1. Запусти фронтенд командой `pnpm dev`.
2. Перейди по адресу `http://localhost:5173/web-app-ar/cms/`. Вверху страницы есть ссылка **Back to Camera**, которая возвращает к AR‑камере.
3. Укажи `VITE_API_BASE_URL` в `.env` (например, `http://localhost:3000`, без `/api`) и запусти API (`pnpm api`).

После авторизации (регистрация и вход выполняются через форму страницы) доступны операции для пользователей с ролью `admin`:

- **Upload** — отправка `.glb` или `.gltf` файла на сервер (`POST /upload`).
- **Edit** — изменение имени и индекса маркера (`PUT /api/models/:id`).
- **Delete** — удаление модели (`DELETE /api/models/:id`).

Для всех действий требуется JWT, сохраняемый в `localStorage` после успешного входа.

> Пользовательские поля (например, имя модели) выводятся в форме через `textContent` и `value`.
> Никогда не вставляйте непроверенные данные в DOM с помощью `innerHTML`.

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

## Расширение: CRM и MongoDB (дорожная карта)

- Интеграция с MongoDB Atlas для хранения статистики и лидов
- Cloudflare R2 — для хранения `.glb` моделей
- Аналитика взаимодействия с маркерами

---

## Статус

- [x] Локальная разработка
- [x] GitHub Pages
- [x] Tailwind CSS
- [ ] Интеграция с MongoDB
- [ ] Cloudflare R2
- [ ] Готовая к продакшену CRM
- [ ] Аналитика и логи по маркерам

---

## Troubleshooting

- Странице требуется доступ к камере. Если разрешение не выдано, вместо AR-сцены может отображаться чёрный экран.
- Если установлена версия Node.js 22 или выше, могут возникнуть проблемы. Используй Node.js 20 LTS или другую поддерживаемую версию (18–21).
- В мобильных браузерах запуск AR иногда требует взаимодействия пользователя (например, нажатия на экран).
- Проверяйте ошибки в консоли и вкладке Network браузера.
- Убедитесь, что `target.mind` присутствует и 3D‑модель скачана (`MODEL_URL=<url> sh public/assets/download_models.sh`) либо задайте `VITE_MODEL_URL`. При недоступности `/api/models` будет использована эта модель с индексом 0.
- Запускайте страницу по HTTPS и предоставляйте доступ к камере.
- При деплое на GitHub Pages проверьте корректность `BASE_URL`.
- Для теста исключите проблемы с моделью, отобразив простую геометрию (например, куб).

---

## Лицензия

Распространяется по [лицензии MIT](./LICENSE).

## Полезные ссылки

- [Документация MindAR.js](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js Docs](https://threejs.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)

---

> Подробнее см. в [AGENTS.md](./AGENTS.md)
