# Detección de ID

El módulo en `node.js` que hace la detección de ID se encuentra en [`lineDetection.js`](/src/services/lineDetection.js).

La función que hace todo el trabajo es `boxDoc(img, areaLoc, coverPercentage)` donde `areaLoc` son las coordenadas del área donde hay que localizar
la ID. `coverPercentage` es un número entre 0 y 1 que indica qué porcentaje del área debe cubrir la ID a detectar; `areaLoc` es un objeto de la forma:

```json
{
	topX: 10.3,
	topY: 13.4,
	bottomX: 56.78,
	bottomY: 45.93
}
```

donde `topX` y `topY` representan la coordenada superior izquierda del rectángulo y
`bottomX` `bottomY` representan la coordenada inferior derecha del mismo.

----------
opencv-express
==============
**This is an example of how to use [opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs) in your web apps with express.js or any other serverside node.js framework. A minimalistic [docker image](https://hub.docker.com/r/justadudewhohacks/opencv-nodejs/) is provided with opencv-3.4.1 and opencv_contrib-3.4.1 + node.js environment set up (opencv4nodejs globally installed).**

### Build the image:
``` bash
docker-compose build
```
### Run:
``` bash
docker-compose up
```

## Docker image:
~353mb (compressed size: ~124mb)
- ubuntu: 16.04
- nodejs: v9.8.0
- npm: v5.6.0
- opencv4nodejs: 3.3.1

## Set up your own image:
If you want to build your own docker image or use a different OpenCV version, you can pull one of the OpenCV 3.x base images: https://hub.docker.com/u/justadudewhohacks/.
