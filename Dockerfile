FROM node:20-alpine

WORKDIR /app

RUN npm install ws

COPY signaling/server.js .

EXPOSE 8080

CMD ["node", "server.js"]
