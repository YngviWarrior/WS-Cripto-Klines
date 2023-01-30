FROM node:alpine

WORKDIR /usr/src/app

COPY . .
RUN npm i

CMD [ "npm", "start" ]
