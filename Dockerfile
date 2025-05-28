FROM node:20

WORKDIR /app

COPY RingBearers/package*.json ./

RUN npm install

COPY RingBearers/ ./

CMD ["npm", "start"]