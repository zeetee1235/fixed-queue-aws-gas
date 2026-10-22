FROM node:22-alpine
WORKDIR /app
COPY package.json queue.mjs server.mjs ./
COPY apps-script/index.html ./apps-script/index.html
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
USER node
CMD ["node", "server.mjs"]
