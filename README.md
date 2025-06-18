# Шаблон AR веб‑приложения

[English README](./README.en.md)

Современное marker‑based AR приложение на MindAR.js, Three.js и Vite. Проект можно развернуть локально и опубликовать на GitHub Pages.

## Требования

- Node.js 20 LTS (Node.js 22+ не поддерживается)
- pnpm 9+
- Современный браузер
- GitHub аккаунт для деплоя

## Установка

```bash
git clone <repo-url>
cd web-app-ar
nvm install 20
nvm use 20
sh scripts/setup-node.sh
pnpm install
pnpm format
cp .env.example .env
pnpm dev
```

При необходимости скачайте тяжёлые модели:

```bash
MODEL_URL=<url> sh public/assets/download_models.sh
```

## Переменные окружения

- `VITE_API_BASE_URL` — базовый URL API без `/api`.
  Для локального режима используйте `http://localhost:3000`. Для продакшена укажите URL своего API, например `https://example.com`.
  Значение не должно содержать лишних пробелов.

## Структура

```plaintext
project-root/
├── public/         # статические файлы и маркеры
├── ar-app/         # код AR‑сцены (файлы в ar-app/src)
├── cms/            # конфигурация AdminJS
├── server.js       # API сервер Express
└── vite.config.js
```

## Скрипты

- `pnpm dev` — режим разработки
- `pnpm lint` — проверка кода
- `pnpm test` — запуск тестов
- `pnpm format` — автоформатирование
- `pnpm build` — production сборка
- `pnpm preview` — просмотр `dist/`
- `pnpm start` — запуск API

## CMS

Панель администрирования построена на [AdminJS](https://github.com/SoftwareBrothers/adminjs).
Маршрут `/cms` подключается через Express (см. `cms/admin.js`) и работает на API-сервере.
Запустите `pnpm dev` и `pnpm api`, затем откройте
`http://localhost:3000/cms/`.
Для входа используйте учётные данные пользователя с ролью `admin`
(`POST /auth/register`). После авторизации можно управлять моделями и
пользователями.

## Сборка и деплой

1. При необходимости укажите `VITE_BASE_PATH` в `vite.config.js`.
2. Выполните `pnpm build` и загрузите содержимое `dist/` на GitHub Pages.

### Cloudflare R2 и Worker

1. Создайте учётную запись на Cloudflare и в разделе R2 создайте bucket (например `models`).
2. Сгенерируйте пару `Access Key`/`Secret Key` и скопируйте URL endpoint.
3. Скопируйте `.env.example` в `.env` и укажите значения:
   ```
   AWS_ACCESS_KEY_ID=<ваш access key>
   AWS_SECRET_ACCESS_KEY=<ваш secret>
   AWS_REGION=auto
   R2_ENDPOINT=https://<id>.r2.cloudflarestorage.com
   R2_BUCKET=<название bucket>
   R2_PUBLIC_URL=https://pub-<id>.r2.dev/
   ```
   Поле `R2_PUBLIC_URL` обязательно должно оканчиваться `/`.
4. Запустите `pnpm start` и убедитесь в консоли в сообщении `✅ [r2] connection OK, buckets: ...`.
5. Функция `syncR2Models` синхронизирует файлы из R2 с коллекцией `models` в MongoDB.
6. Минимальный Worker находится в `src/worker.ts`. Для деплоя выполните:
   ```bash
   pnpm install
   pnpm format
   CLOUDFLARE_API_TOKEN=<token> pnpm run worker:deploy
   ```
   Используется CLI [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) (установлен в devDependencies). Создайте API Token в панели Cloudflare (My Profile → API Tokens, шаблон **Edit Cloudflare Workers**), установите его в переменную `CLOUDFLARE_API_TOKEN` и запускайте деплой. Подробнее см. в [документации Cloudflare](https://developers.cloudflare.com/api/tokens/create/).

## Статус

- Локальная разработка ✔️
- GitHub Pages ✔️
- Tailwind CSS ✔️
- Интеграция с MongoDB в разработке
  Полная дорожная карта: [ROADMAP.md](./ROADMAP.md)
  Список изменений: [CHANGELOG.md](./CHANGELOG.md)

## Полезные ссылки

- [Документация MindAR.js](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js Docs](https://threejs.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)

## Лицензия

Проект распространяется по [лицензии MIT](./LICENSE).

Подробнее см. в [AGENTS.md](./AGENTS.md)
