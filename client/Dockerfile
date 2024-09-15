FROM node:20-alpine AS builder

WORKDIR /app

COPY ./package.json ./

RUN npm run install

COPY . .

RUN npm run build

FROM nginx:1.27.1

EXPOSE 3000

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html