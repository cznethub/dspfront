FROM node:14 as build-stage
WORKDIR /dspfront
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build-prod

FROM nginx:1.23.1 as production-stage
RUN mkdir /dspfront
COPY --from=build-stage /dspfront/dist /dspfront
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 5001
