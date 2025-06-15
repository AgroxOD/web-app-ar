# Шаблон AR веб‑приложения

[English README](./README.en.md)

Современное marker‑based AR приложение на MindAR.js, Three.js и Vite. Проект можно развернуть локально и опубликовать на GitHub Pages или Render.

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
cp .env.example .env
pnpm dev
```

При необходимости скачайте тяжёлые модели:

```bash
MODEL_URL=<url> sh public/assets/download_models.sh
```

## Структура

```plaintext
project-root/
├── public/         # статические файлы и маркеры
├── src/            # код AR‑сцены
├── cms/            # минимальная CMS
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

Каталог `cms/` основан на шаблоне **MajesticAdmin**. Страницу CMS следует
открывать по пути `${base}cms/`, где `${base}` — значение `base` из
`vite.config.js` (по умолчанию `/web-app-ar/`). Пример локального URL:
`http://localhost:5173/web-app-ar/cms/`.

1. Запустите `pnpm dev` и API командой `pnpm api`.
2. Укажите `VITE_API_BASE_URL` в `.env`.
3. Зарегистрируйте пользователя с ролью `admin` через `/auth/register` и
   войдите в CMS. После входа станет доступна форма **Upload** для загрузки
   моделей.
4. Для использования локальных шрифтов и изображений поместите файлы в
   `cms/fonts/` и `cms/images/`, скорректировав пути в
   `public/cms/majestic/style.css`.
5. При необходимости скачайте исходный шаблон Majestic Admin с GitHub:
   <https://github.com/BootstrapDash/MajesticAdmin-Free-Bootstrap-Admin-Template/archive/refs/heads/master.zip>
   и распакуйте файлы в каталог `cms/`.
6. Все файлы каталога `cms/` автоматически копируются плагином
   `vite-plugin-static-copy` во время сборки, поэтому дополнительные действия
   не требуются.

## Сборка и деплой

1. При необходимости укажите `VITE_BASE_PATH` в `vite.config.js`.
2. Выполните `pnpm build` и загрузите содержимое `dist/` на GitHub Pages или Render.

## Статус

- Локальная разработка ✔️
- GitHub Pages ✔️
- Tailwind CSS ✔️
- Интеграция с MongoDB в разработке

## Полезные ссылки

- [Документация MindAR.js](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js Docs](https://threejs.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)

## Лицензия

Проект распространяется по [лицензии MIT](./LICENSE).

Подробнее см. в [AGENTS.md](./AGENTS.md)
