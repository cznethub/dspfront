FROM node:latest as build-stage
WORKDIR /dspfront
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx:latest as production-stage
RUN mkdir /app
COPY --from=build-stage /dspfront/dist /app
COPY nginx.conf /etc/nginx/nginx.conf