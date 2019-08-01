const express = require('express');

const services = require('./services');

const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(express.static(__dirname + '/views'));
app.use(require('body-parser').json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.sendFile('./index.html');
});

const requiresImgBase64 = (req, res, next) => {
    const { imgBase64 } = req.body;
    if (typeof imgBase64 !== 'string') {
	return res.status(404).send('imgData must be the base64 string of the image');
    }
    req.params.img = services.decodeFromBase64(imgBase64);
    return next();
}

app.post('/faces', requiresImgBase64, (req, res) => {
    const facesImg = services.detectFaces(req.params.img);
    const facesImgBase64 = services.encodeJpgBase64(facesImg);
    res.status(202).send({ base64Data: facesImgBase64 });
});

app.post('/cfeBarcode', requiresImgBase64, async (req, res) => {
    try{
	console.time('getCFEBarcode');
	const { cfeText, cfeImg } = await services.detectCFEBarcode(req.params.img);
	console.timeEnd('getCFEBarcode');
	console.log(cfeText);
	const cfeImgBase64 = services.encodeJpgBase64(cfeImg);
	res.status(202).send({ detectedText: cfeText,
			       base64Data: cfeImgBase64 });
    } catch(e) {
	res.send("error");
    }
});

app.post('/cfePrice', requiresImgBase64, async (req, res) => {
    try{
	console.time('getCFEPayment');
	const { cfeText, cfeImg } = await services.detectCFEPrice(req.params.img);
	console.timeEnd('getCFEPayment');
	console.log(cfeText);
	const cfeImgBase64 = services.encodeJpgBase64(cfeImg);
	res.status(202).send({ detectedText: cfeText,
			       base64Data: cfeImgBase64 });
    } catch(e) {
	res.send("error");
    }
});

app.post('/lines', requiresImgBase64, (req, res) => {
    const linesImg = services.detectLines(req.params.img);
    const linesImgBase64 = services.encodeJpgBase64(linesImg);
    res.status(202).send({ base64Data: linesImgBase64 });
});

app.post('/features/orb', requiresImgBase64, (req, res) => {
    const orbImg = services.detectKeyPointsORB(req.params.img);
    const orbImgBase64 = services.encodeJpgBase64(orbImg);
    res.status(202).send({ base64Data: orbImgBase64 });
});

app.post('/features/surf', requiresImgBase64, (req, res) => {
    const surfImg = services.detectKeyPointsSURF(req.params.img);
    const surfImgBase64 = services.encodeJpgBase64(surfImg);
    res.status(202).send({ base64Data: surfImgBase64 });
});

app.post('/features/sift', requiresImgBase64, (req, res) => {
    const siftImg = services.detectKeyPointsSIFT(req.params.img);
    const siftImgBase64 = services.encodeJpgBase64(siftImg);
    res.status(202).send({ base64Data: siftImgBase64 });
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
