**Версия:** 0.4
**Обновлено:** 10.06.2025

---

## Оглавление

- [Описание](#описание)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Инструкция по разработке](#инструкция-по-разработке)
- [Скрипты](#скрипты)
- [Как создать .mind-файл для маркера](#как-создать-mind-файл-для-маркера)
- [Admin.html: каталог моделей](#adminhtml)
- [Инструкция по публикации на GitHub Pages](#инструкция-по-публикации-на-github-pages)
- [Настройка VS Code](#vs-code-setup)
- [Расширение: CRM и MongoDB](#расширение-crm-и-mongodb)
- [Статус и дорожная карта](#статус-и-дорожная-карта)
- [Ссылки](#ссылки)

---

## Описание

**AR-веб-приложение** для интерактивных маркетинговых кампаний, образовательных проектов и B2B/CRM-решений.  
Использует marker-based AR (**MindAR.js**), 3D (**Three.js**), современную сборку (**Vite**, **pnpm**) и публикацию на **GitHub Pages**.  
Цель — предоставить платформу для лёгкого создания и масштабирования AR-экспериментов с последующей интеграцией в CRM (MongoDB).

---

## Технологии

- [Vite](https://vitejs.dev/) — быстрый сборщик для разработки и билда
- [Three.js](https://threejs.org/) — 3D-графика в браузере
- [MindAR.js (mindar-image)](https://hiukim.github.io/mind-ar-js-doc/) — AR SDK с marker-based трекингом
- [pnpm](https://pnpm.io/) — менеджер пакетов
- [Visual Studio Code](https://code.visualstudio.com/) — основная IDE
- _(В перспективе)_ [MongoDB](https://www.mongodb.com/) — хранение пользовательских данных и CRM-метаданных
- _(Планируется)_ [Cloudflare R2](https://www.cloudflare.com/products/r2/) — для хранения `.glb`-моделей

---

## Структура проекта

```plaintext
project-root/
├── public/
│   ├── marker.png         # PNG изображение маркера (можно несколько)
│   ├── target.mind        # Сгенерированный файл таргета (для каждого маркера свой .mind)
│   └── assets/            # Прочие ассеты (3D-модели, изображения)
├── src/
│   ├── ar-scene.js        # Инициализация и логика AR
│   └── utils/             # Вспомогательные функции (по необходимости)
├── index.html
├── vite.config.js
├── package.json
└── .vscode/               # Настройки редактора (см. ниже)
```

---

## Требования

- **Node.js**: 18.x LTS или новее
- **pnpm**: 9.x или новее
- В репозитории хранится `pnpm-lock.yaml`; `package-lock.json` не используется.
- В `.gitattributes` указано `pnpm-lock.yaml merge=ours`, локальный lockfile сохраняется при слияниях.
- При конфликте lockfile установи утилиту `@pnpm/merge-lockfile-changes` командой `pnpm add -D @pnpm/merge-lockfile-changes` и запусти `npx @pnpm/merge-lockfile-changes`.
- **Современный браузер** (Chrome, Edge, Firefox)
- Рекомендуется: аккаунт на [GitHub](https://github.com/) для деплоя
- _(Планируется)_: доступ к MongoDB Atlas или своему серверу MongoDB

---

## Быстрый старт

```bash
# 1. Клонируй репозиторий
git clone <repo-url>
cd <project-name>

# 2. Установи зависимости
pnpm install

# 3. Сгенерируй target.mind для своего маркера через онлайн-сервис:
#    3.1 Перейди на https://hiukim.github.io/mind-ar-js-doc/tools/compile/
#    3.2 Загрузите PNG/JPG маркер
#    3.3 Скачай target.mind и положи в папку public/

# 4. Запусти проект в режиме разработки
pnpm dev

pnpm build    # production сборка
pnpm preview  # проверка dist/

# Открой http://localhost:5173/web-app-ar/ в браузере и нажми кнопку **Start AR** для запуска сцены
```

---

## Инструкция по разработке

1. **Создай PNG-маркеры** и положи их в папку `public/`.
2. **Сгенерируй .mind-файл для каждого маркера через онлайн-сервис:**
   - Перейди на [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)
   - Загрузите свой маркер (PNG/JPG)
   - Скачай target.mind и положи в `public/` (рядом с marker.png)
3. Добавь новые ассеты (3D-модели, изображения) в `public/assets/`.
4. Пиши основную логику в `src/ar-scene.js`; все ассеты загружаются из `public/`.
5. Настрой кодстайл и автоформатирование (см. [Настройка VS Code](#vs-code-setup)).
6. Для переменных окружения используй `.env` (если потребуются API-ключи).
   - Для отправки аналитики укажи `VITE_ANALYTICS_ENDPOINT=<url>`
   - Для загрузки моделей в R2 задай `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `R2_ENDPOINT` и `R2_BUCKET`

### Как обновить ветку и разрешить конфликт pnpm-lock.yaml

1. Сохрани текущие изменения:
   ```bash
   git stash
   ```
2. Получи свежие данные и смёрджи ветку `main`:
   ```bash
   git fetch origin && git merge origin/main
   ```
3. Если появился конфликт в `pnpm-lock.yaml`, примени свою версию и переустанови зависимости:
   ```bash
   git checkout --ours pnpm-lock.yaml
   pnpm install
   ```
4. Добавь и закоммить обновлённый lock-файл, затем верни изменения из стэша:
   ```bash
   git add pnpm-lock.yaml
   git commit -m "chore: resolve lockfile conflict"
   git stash pop
   ```

## Скрипты

- `pnpm dev` — запуск сервера разработки.
- `pnpm lint` — проверка кода ESLint.
- `pnpm format` — автоформатирование Prettier.
- `pnpm build` — production сборка.
- `pnpm preview` — предпросмотр собранных файлов.

---

## Как создать .mind-файл для маркера

- Используй официальный онлайн-сервис [MindAR Marker Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)
- Загрузите PNG/JPG с маркером
- Скачай target.mind и положи его в папку `public/` проекта (рядом с marker.png)

## Admin.html {#adminhtml}

`public/admin.html` — минимальная страница для загрузки и выбора 3D‑моделей.
По умолчанию она обращается к удалённому API
`https://web-app-ar-api.onrender.com`.
Запускайте локальный сервер (`pnpm api`), если хотите использовать собственный
бэкенд, и измените константу `API_BASE` в файле.

---

## Инструкция по публикации на GitHub Pages

1. В `vite.config.js` укажи:
   ```js
   export default defineConfig({
     base: '/web-app-ar/',
     plugins: [
       /* ... */
     ],
   });
   ```
2. Выполни сборку:
   ```bash
   pnpm build
   ```
3. Запушь содержимое папки `dist/` в ветку `gh-pages`:

   ```bash
   git checkout --orphan gh-pages
   git --work-tree dist add --all
   git --work-tree dist commit -m 'Deploy'
   git push origin gh-pages --force
   git clean -fd      # remove untracked files (dist, etc.)
   git checkout main
   ```

````

> ⚠️ **Важно**: Значение `base` должно совпадать с названием репозитория на GitHub!

Без очистки рабочее дерево сохранит файлы из `gh-pages`, что может привести к ошибке при переключении на `main`.

4. (Опционально) Настрой [GitHub Actions](https://docs.github.com/ru/actions) для автоматического деплоя.

5. Возможные проблемы:
- Проверь корректность путей в `index.html`
- Для AR-функций нужно HTTPS (GitHub Pages поддерживает)

---

<a name="vs-code-setup"></a>
## Настройка VS Code

- Установи расширения:
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Vite](https://marketplace.visualstudio.com/items?itemName=antfu.vite)
- Конфигурация ESLint использует flat config (`eslint.config.js`) с интеграцией Prettier; здесь же объявлены глобальные переменные `window`, `document` и `alert`.
- Рекомендуемые настройки (`.vscode/settings.json`):
```json
{
"editor.formatOnSave": true,
"editor.codeActionsOnSave": {
"source.fixAll.eslint": true
}
}
````

- Работа через встроенный терминал (`pnpm dev`).
- (Опционально) Настрой `.vscode/tasks.json` для автоматизации задач.

---

## Расширение: CRM и MongoDB

> Разработка в отдельном агенте/модуле, интеграция по мере готовности.

- **API-интеграция** с [MongoDB Atlas](https://www.mongodb.com/atlas) или своим сервером MongoDB
- **Логирование** взаимодействия пользователей с маркерами
- **Привязка данных** (аналитика, контактные формы) к каждому marker target
- **Хранение .glb** моделей в облаке ([Cloudflare R2](https://www.cloudflare.com/products/r2/))
- **Дорожная карта** (MVP):
  - [ ] Запись уникальных посещений маркеров
  - [ ] Базовая статистика по AR-сценам
  - [ ] Отправка форм с лид-данными в MongoDB

---

## Статус и дорожная карта

- [x] Локальная разработка
- [x] Совместимость с GitHub Pages
- [ ] Интеграция с MongoDB
- [ ] Аналитика и логи по маркерам
- [ ] Интеграция с Cloudflare R2
- [ ] Расширение до production-ready CRM

---

## Ссылки

- [Документация MindAR.js](https://hiukim.github.io/mind-ar-js-doc/)
- [MindAR Marker Compiler (онлайн-конвертер)](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)
- [MindAR Examples](https://github.com/hiukim/mind-ar-js/tree/main/examples)
- [Three.js Docs](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
- [Vite Docs](https://vitejs.dev/guide/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Cloudflare R2](https://www.cloudflare.com/products/r2/)

---

> Если появятся вопросы — см. [Issues](https://github.com/<your-org-or-user>/<repo>/issues) или обратись к мейнтейнеру.
