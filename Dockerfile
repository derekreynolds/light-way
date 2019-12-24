FROM node:13.2-alpine3.10

RUN apk --allow-untrusted add --no-cache --repository http://alpine.dl.oz.nu/ffmpeg ffmpeg ffmpeg-libs

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --production

RUN npm install pm2 -g

RUN npm install typescript -g

ADD . /usr/src/app

RUN npm run build

EXPOSE 4000

CMD ["pm2-runtime","dist/server.js"]