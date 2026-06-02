FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy source directories explicitly to avoid copying host node_modules
COPY src ./src
COPY assets ./assets
COPY index.html ./
COPY tsconfig.json ./
COPY vite.config.ts ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
