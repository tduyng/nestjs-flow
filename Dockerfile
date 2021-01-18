FROM node:lts-alpine

WORKDIR /usr/src/app

ENV NODE_ENV development
COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

CMD ["yarn", "start:dev"]