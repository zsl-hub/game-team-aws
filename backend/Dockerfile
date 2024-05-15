FROM node:20-alpine

COPY config /app/config/
COPY package.json /app/
COPY package-lock.json /app/
COPY env /app/
COPY src /app/src/

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "prod"]