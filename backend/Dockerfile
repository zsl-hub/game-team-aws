FROM node:20-alpine

COPY config /app/config/
COPY package.json /app/
COPY package-lock.json /app/
COPY env /app/env/
COPY src /app/src/

WORKDIR /app

RUN npm install

EXPOSE ${BACKEND_PORT}

CMD ["npm", "run", "loc"]