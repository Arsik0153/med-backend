FROM node:18

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY prisma ./prisma

RUN yarn prisma generate

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]