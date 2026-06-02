FROM node:20-alpine

# Install OpenSSL and libc6-compat for Prisma compatibility on alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 5000

# Execute database setup and seeding at container startup
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed && npm run dev"]
