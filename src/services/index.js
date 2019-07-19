global.cv = require('/usr/lib/node_modules/opencv4nodejs');

const { decodeFromBase64, encodeJpgBase64 } = require('./imgcodecs');
const detectFaces = require('./faceDetection');
const detectLines = require('./lineDetection');
const {
	detectKeyPointsORB,
	detectKeyPointsSURF,
	detectKeyPointsSIFT
} = require('./featureDetection');

module.exports = {
	detectLines,
	decodeFromBase64,
	encodeJpgBase64,
	detectFaces,
	detectKeyPointsORB,
	detectKeyPointsSURF,
	detectKeyPointsSIFT
};
