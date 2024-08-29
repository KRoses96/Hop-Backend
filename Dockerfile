FROM satantime/puppeteer-node:20.9.0-bookworm

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]