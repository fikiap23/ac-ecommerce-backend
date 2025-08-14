FROM node:22.5.1-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN yarn

COPY . .

COPY ./build/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
