FROM node:latest
WORKDIR /dspfront
COPY package*.json ./
RUN npm install
EXPOSE 5001
CMD ["npm", "run", "serve", "--", "--port", "5001", "--host", "dspfront"]
