FROM node:20-alpine

ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV ABLY_API_KEY=${ABLY_API_KEY}

COPY config /app/config/
COPY package.json /app/
COPY package-lock.json /app/
# COPY env /app/env/
COPY src /app/src/

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "loc"]