FROM node:latest as build-stage
WORKDIR /dspfront
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx:latest as production-stage
RUN mkdir /dspfront
COPY --from=build-stage /dspfront/dist /dspfront
COPY nginx.conf /etc/nginx/nginx.conf