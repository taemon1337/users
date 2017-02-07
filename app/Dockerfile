FROM node

RUN npm install express request

COPY ./ /work
WORKDIR /work

EXPOSE 8080
ENV PORT=8080

CMD node run.js
