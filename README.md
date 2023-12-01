## Description

backend system

## Installation

```bash
pnpm install
```

## Running the app

First migrate database:
```
npx prisma migrate dev
```
Then generate client:
```
npx prisma generate
```

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


## Used technology
- Typescript
- Nest.js
- Prisma
- Mysql
- etc