## Description

No-code form builder backend system

Frontend part: (Will be here soon)

## Installation

```bash
pnpm install
```

## Running the app

```bash
# development
pnpm start

# watch mode
pnpm start:dev

# production mode
pnpm start:prod

# watch mode with swc compiler (faster)
pnpm start:dev-swc
```

## Running using docker
```
docker compose up
```
To rebuild app:
```
docker compose up --build
```

## Used technology
- Typescript
- Nest.js
- Prisma
- Postgresql
- Socket.io
- Bullmq
- Redis
- etc