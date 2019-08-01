const { decodeFromBase64, encodeJpgBase64 } = require('./imgcodecs');
const { TesseractWorker } = require('tesseract.js');

const worker = new TesseractWorker();
const paymentRE = /\d+\.\d{2}/;
const barcodeRE = /\d{2} ?\d{12} ?\d{6} ?\d{9} ?\d/;
const LEFTSIDE = 1;
const RIGHTSIDE = 2;
const FOOTPAGE = 3;

const cropImage = (img, side) => {
    // Get footpage
    const footpageStart = Math.floor(img.rows * 5 / 6);
    const footpageWidth = img.cols - 1;
    const footpageHeight = img.rows - footpageStart - 1;
    const footpage = img.getRegion(new cv.Rect(0, footpageStart,
					       footpageWidth, footpageHeight));
    if (side == RIGHTSIDE) {		
	// Get lower right corner
	const verticalLine = Math.floor(img.cols * 3 / 5);
	const rightSideWidth = footpage.cols - verticalLine - 1;
	const rightSideHeight = footpage.rows - 1;
	const rightSide = footpage.getRegion(new cv.Rect(verticalLine, 0,
							 rightSideWidth,
							 rightSideHeight));
	return rightSide;
    } else if (side == LEFTSIDE) {
	// Get lower left corner
	const verticalLine = Math.floor(img.cols * 3 / 5);
	const leftSideWidth = verticalLine - 1;
	const leftSideHeight = footpage.rows - 1;
	const leftSide = footpage.getRegion(new cv.Rect(0, 0,
							leftSideWidth,
							leftSideHeight));
	return leftSide;
    } else if (side == FOOTPAGE) {
	return footpage;
    }
};


const getPayment = text => {
    const prep_text = text.replace(",", "");
    const match = prep_text.match(paymentRE);
    if (match) {
	return match[0];
    } else {
	return "PAYMENT NOT FOUND";
    }
};

const getBarcode = text => {
    const match = text.match(barcodeRE);
    if (match) {
	return match[0];
    } else {
	return "BARCODE NUMBER NOT FOUND";
    }
};

const detectCFEPrice = img => {
    return new Promise((resolve, reject) => {
	const footpage = cropImage(img, RIGHTSIDE);
	const footpage64 = 'data:image/jpeg;base64,' + encodeJpgBase64(footpage);
	worker.recognize(footpage64)
	    .then(result => {
		const payment = getPayment(result.text)
		console.log(payment);
		resolve({ cfeText: payment,
			  cfeImg: footpage });
	    })
	    .catch("error",err => {
		console.log(err)
		reject({ cfeText: null, cfeImg: null });
	    });
    });
};

const detectCFEBarcode = img => {
    return new Promise((resolve, reject) => {
	const footpage = cropImage(img, LEFTSIDE);
	const footpage64 = 'data:image/jpeg;base64,' + encodeJpgBase64(footpage);
	worker.recognize(footpage64)
	    .then(result => {
		console.log(result.text);
		const barcode = getBarcode(result.text)
		console.log(barcode);
		resolve({ cfeText: barcode,
			  cfeImg: footpage });
	    })
	    .catch("error",err => {
		console.log(err)
		reject({ cfeText: null, cfeImg: null });
	    });
    });
};

module.exports = { detectCFEPrice, detectCFEBarcode };
