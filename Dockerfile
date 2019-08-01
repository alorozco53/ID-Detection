FROM justadudewhohacks/opencv-nodejs:node9-opencv3.4.1-contrib

WORKDIR /app

# RUN apt-get update && apt-get install -y software-properties-common && add-apt-repository -y ppa:alex-p/tesseract-ocr

COPY ./package.json /app/package.json
RUN apt-get update
# RUN apt -y install \
#     tesseract-ocr \
# 	libtesseract-dev \
#     tesseract-ocr-spa
RUN apt-get clean
RUN npm install -g nodemon && npm install
# RUN npm install node-tesseract-ocr
RUN npm install tesseract.js@next

EXPOSE 3000

COPY ./src /app/src

CMD ["nodemon", "-L", "./src/server.js"]
