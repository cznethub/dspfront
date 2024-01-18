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

# Allow substitution of env vars at runtime
COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 5001

CMD ["nginx", "-g", "daemon off;"]
