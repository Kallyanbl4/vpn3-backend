# VPN3 Backend

![vpn3-backend](https://img.shields.io/badge/status-active-brightgreen)

Backend-сервис для управления пользователями VPN-системы, аутентификации, взаимодействия с VPN-сервером и интеграции с Telegram-ботом.

## 📌 Возможности

- Регистрация и аутентификация пользователей (JWT, bcrypt)
- Поддержка GraphQL API с настройкой контекста пользователя
- Работа с базой данных через Prisma ORM (PostgreSQL)
- Кэширование запросов с Redis (CacheModule)
- Интеграция с Telegram (бот для оповещений и управления)
- Валидация входных данных с использованием `class-validator`
- Гибкая конфигурация через переменные окружения (`ConfigModule`)

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```sh
$ git clone https://github.com/Kallyanbl4/vpn3-backend.git
$ cd vpn3-backend
```

### 2. Установка зависимостей

```sh
$ yarn install
```

### 3. Настройка окружения

Создайте файл `.env` на основе `.env.example` и укажите значения переменных окружения:
```env
DATABASE_URL=postgres://user:password@localhost:5432/vpn3
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 4. Применение миграций и генерация Prisma-клиента

```sh
$ npx prisma migrate dev
$ npx prisma generate
```

### 5. Запуск сервера

#### В режиме разработки:
```sh
$ yarn start:dev
```

#### В продакшен-режиме:
```sh
$ yarn build && yarn start:prod
```

### 6. Тестирование

```sh
$ yarn test
```

## 🔥 API-эндпоинты

### GraphQL API
- GraphQL Playground доступен по адресу: `http://localhost:3000/graphql`
- Основные запросы:
  - `register` – регистрация пользователя
  - `login` – вход, выдача JWT-токена
  - `getUser` – получение информации о пользователе

## 🛠 Технологии

- **NestJS** – серверный фреймворк
- **Prisma** – ORM для работы с базой данных
- **Redis** – кэширование
- **GraphQL** – основное API
- **JWT** – авторизация пользователей
- **Telegraf** – Telegram-бот

## 📜 Лицензия
MIT

## 👥 Контакты

Если у вас есть вопросы или предложения, создайте issue или свяжитесь со мной:
- Telegram: [@your_username](https://t.me/your_username)
- Email: your@email.com

