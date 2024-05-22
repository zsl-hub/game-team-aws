FROM node:20-alpine

ARG ABLY_API_KEY
ENV ABLY_API_KEY=$ABLY_API_KEY

COPY config /app/config/
COPY package.json /app/
COPY package-lock.json /app/
COPY env /app/env/
COPY src /app/src/

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "loc"]