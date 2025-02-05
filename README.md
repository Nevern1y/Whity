\\\ Установить зависимости
npm install

\\\ База Данных (MySQL)

# Генерация Prisma Client
npx prisma generate

# Применение миграций
npx prisma migrate dev

# Или если хотите просто синхронизировать схему
npx prisma db push

\\\

# Режим разработки
npm run dev
