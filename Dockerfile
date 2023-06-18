FROM --platform=linux/amd64 node:18 as build
WORKDIR /build
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY src ./src
RUN ls -a
RUN npm install
RUN npm run build

FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=production
COPY --from=build /build/dist .
EXPOSE 3000
USER node
CMD ["node","."]