FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
