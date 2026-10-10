# Smart Food Industries — онлайн-хакатон ATU 2026

Страница студенческого хакатона Алматинского технологического университета.
12 ноября 2026 · 10:00–16:00 (Алматы, UTC+5) · онлайн · RU / ҚАЗ.

## Структура
- `index.html` — разметка
- `assets/content.js` — все тексты на русском (`ru`) и казахском (`kk`)
- `assets/app.js` — настройки (`CONFIG`), рендер, переключатель языка, таймер
- `assets/styles.css` — стили
- `docs/polozhenie-hackathon-atu.pdf` — утверждённое Положение
- `hackathon.ics` — событие для календаря

## Что настроить
В `assets/app.js` → `CONFIG.registrationUrl` вставьте ссылку на форму регистрации
(Google Forms и т.п.). Пока пусто — кнопка показывает «Форма регистрации откроется в ближайшее время».

Язык можно задать ссылкой: `?lang=kk` или `?lang=ru`.

## Публикация (GitHub Pages)
Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
Через минуту сайт будет доступен по адресу `https://drashidinov.github.io/ATUHackathon2026/`.
