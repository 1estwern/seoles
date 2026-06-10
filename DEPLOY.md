# Деплой SEOLES на 2.56.240.192

Среда Cursor **не имеет** доступа к вашему серверу (таймаут SSH/80). Выполните команды **на своём Mac** в Terminal.

## 1. Проверка SSH

```bash
ssh root@2.56.240.192 "echo OK && uname -a"
```

При первом входе подтвердите fingerprint (`yes`).

## 2. Bootstrap сервера (один раз)

```bash
cd ~/Desktop/seoles
scp infra/scripts/server-bootstrap.sh root@2.56.240.192:/tmp/
ssh root@2.56.240.192 'bash /tmp/server-bootstrap.sh'
```

## 3. Сгенерировать `.env` и задеплоить

```bash
cd ~/Desktop/seoles
chmod +x infra/scripts/*.sh
./infra/scripts/generate-env.sh | tee .env
# Сохраните пароль admin из stderr!

rsync -avz --delete \
  --exclude node_modules --exclude .next --exclude dist --exclude .git \
  ./ root@2.56.240.192:/opt/seoles/

ssh root@2.56.240.192 'cd /opt/seoles && docker compose --profile with-nginx up -d --build'
```

## 4. Проверка

Откройте http://2.56.240.192 — вход `admin@seoles.local` и пароль из шага 3.

```bash
curl -s http://2.56.240.192/api/health
```

## Безопасность

- Смените root-пароль после настройки: `passwd`
- Лучше отключить вход по паролю и использовать SSH-ключ
- Не коммитьте `.env` в git
