FROM node:14-alpine

WORKDIR /usr/src/app

ENV NODE_ENV development
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./


CMD ["yarn", "start:dev"]
