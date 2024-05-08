FROM node:20-alpine

COPY package.json /app/
COPY env /app/
COPY src /app/

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "prod"]