FROM node:14
WORKDIR /dspfront
COPY package*.json ./
RUN npm i @vue/cli-service
RUN npm install --production
COPY . .
RUN npm run build-prod
EXPOSE 5001
CMD ["npm", "run", "serve-prod", "--", "--port", "5001", "--host", "dspfront"]
