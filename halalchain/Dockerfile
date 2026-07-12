FROM node:18-alpine

WORKDIR /app

# TensorFlow / build deps (needed by @tensorflow/tfjs-node)
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]

