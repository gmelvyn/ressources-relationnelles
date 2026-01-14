FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/front/package*.json ./apps/front/

RUN npm install --workspace=apps/front

RUN npm i -g serve

COPY apps/front ./apps/front

WORKDIR /app/apps/front

RUN npm run build

EXPOSE 8080

CMD [ "serve", "-s", "dist" ]