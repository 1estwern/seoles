# SEOLES

Внутренняя веб-CRM для команды SEOLES: проекты, задачи, audit log, Make-уведомления, приватные AI-чаты.

## Стек

NestJS + Prisma + PostgreSQL · Next.js + Tailwind · Docker Compose + Nginx

## Структура

```
seoles/
  apps/api/
  apps/web/
  infra/
```

## Продакшен

- **Сервер:** `2.56.240.192`
- **Каталог:** `/opt/seoles`
- **URL:** http://2.56.240.192 (пока без HTTPS)

## Локальная разработка

```bash
cd ~/Desktop/seoles
cp .env.example .env

cd apps/api && npm install && npx prisma migrate dev && npx prisma db seed && npm run dev
cd apps/web && npm install && echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local && npm run dev
```

## Деплой

```bash
export SSHPASS='your-root-password'   # не коммитить
./infra/scripts/deploy.sh root@2.56.240.192
```

Первый раз на сервере:

```bash
sshpass -e ssh root@2.56.240.192 'bash -s' < infra/scripts/server-bootstrap.sh
```

## Бэкап БД

```bash
ssh root@2.56.240.192 'cd /opt/seoles && docker compose exec -T postgres pg_dump -U crm crm' > backup.sql
```

## Логи

```bash
ssh root@2.56.240.192 'cd /opt/seoles && docker compose logs -f api web nginx'
```
