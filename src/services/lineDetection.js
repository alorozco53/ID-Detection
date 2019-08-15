const { decodeFromBase64, encodeJpgBase64 } = require('./imgcodecs');

// Erosion -> Dilation constants
const kernelED = new cv.Mat(5, 5, cv.CV_8UC1, 1);
const anchorED = new cv.Point(-1, -1);

// Canny constants
const lowThresholdC = 50;
const ratioC = 3;
const kernelSizeC = 3;

// Weighting parameters, this will decide the quantity of an image to be added to make a new image.
const alpha = 0.5;
const beta = 1.0 - alpha;

// More constants
const CV_MORPH_RECT = 0;

const boundingBox = contours => {
    // Get bounding box corners
    var minX = Number.POSITIVE_INFINITY;
    var minY = Number.POSITIVE_INFINITY;
    var maxX = Number.NEGATIVE_INFINITY;
    var maxY = Number.NEGATIVE_INFINITY;
    var i = 0;
    contours.forEach(cnt => {
	points = cnt.getPoints()
	if (i > 0) {
	    cnt.getPoints().forEach(p => {
		if (p.x < minX) {
		    minX = p.x;
		}
		if (p.y < minY) {
		    minY = p.y;
		}
		if (p.x > maxX) {
		    maxX = p.x;
		}
		if (p.y > maxY) {
		    maxY = p.y;
		}
	    });
	}
	i++;
    });
    return {
	topCorner: new cv.Point(minX, minY),
	bottomCorner: new cv.Point(maxX, maxY)
    }
};

// Line computation (via kernels)
const computeLines = img => {
    // Defining a kernel length
    const kernelLength = Math.floor(img.cols / 80);
    // A vertical kernel of (1 X kernel_length), which will detect all the vertical lines from the image.
    const verticalKernel = cv.getStructuringElement(CV_MORPH_RECT, new cv.Size(1, kernelLength));

    // A horizontal kernel of (kernel_length X 1), which will help to detect all the horizontal line from the image.
    const horiKernel = cv.getStructuringElement(CV_MORPH_RECT, new cv.Size(kernelLength, 1));
    // A kernel of (3 X 3) ones.
    const kernel = cv.getStructuringElement(CV_MORPH_RECT, new cv.Size(3, 3));

    // Morphological operation to detect vertical lines from an image
    const imgTemp1 = img.erode(verticalKernel, anchorED, 3);
    const verticalLinesImg = imgTemp1.dilate(verticalKernel, anchorED, 3);

    // Morphological operation to detect horizontal lines from an image
    const imgTemp2 = img.erode(horiKernel, anchorED, 3);
    const horizontalLinesImg = imgTemp2.dilate(horiKernel, anchorED, 3);

    // Add two image with specific weight parameter to get a third image as summation of two image.
    const imgFinalBin = verticalLinesImg.addWeighted(alpha, horizontalLinesImg, beta, 0.0)
	  .bitwiseNot().erode(kernel, anchorED, 2)
	  .threshold(128, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

    // Find contours for image, which will detect all the boxes
    return imgFinalBin.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
};

const edgeHighlight = img => {
    // Grayscale image
    const gray = img.bgrToGray();

    // Blur and invert colours
    const blur = gray.gaussianBlur(new cv.Size(3, 3), 0);
    const inv = blur.bitwiseNot();

    // Erosion -> Dilation
    const erosion = inv.erode(kernelED, anchorED, 1);
    const dilation = erosion.dilate(kernelED, anchorED, 1);

    // Canny edge detection
    const blur2 = dilation.gaussianBlur(new cv.Size(3, 3), 0);
    return blur2.canny(lowThresholdC, lowThresholdC*ratioC, kernelSizeC);
};

const boxDoc = (im, areaLoc, coverPercentage) => {
    // Decode image
    var img = decodeFromBase64(im);
    const original = img.copy();
    
    // Parse area coordinates
    const { topX, topY, bottomX, bottomY } = areaLoc;

    // Crop area
    width = bottomX - topX;
    height = bottomY - topY;
    area = img.getRegion(new cv.Rect(topX, topY, width, height));
    
    // Highlight edges
    const edges = edgeHighlight(area);

    // Compute horizontal and vertical lines
    const lines = computeLines(edges);
    console.log(lines.length);

    // Compute bounding box
    const {topCorner, bottomCorner} = boundingBox(lines);

    // Check if box is large enough
    if (isFinite(topCorner.x) && isFinite(topCorner.y) && isFinite(bottomCorner.x) && isFinite(bottomCorner.y)) {
	boxWidth = (bottomCorner.x - topCorner.x);
	boxHeight = (bottomCorner.y - topCorner.y);
	areaBox = boxWidth * boxHeight;
	areaTotal = width * height;
	idLoc = original.getRegion(new cv.Rect(topCorner.x, topCorner.y, boxWidth, boxHeight));
	return {
	    idImage: encodeJpgBase64(idLoc),
	    decision: (areaBox / areaTotal) >= coverPercentage
	};
    } else {
	return {
	    idImage: null,
	    decision: false
	};
    }
};

const boxDocAllImage = img => {
    // Highlight edges
    const edges = edgeHighlight(img);

    // Compute horizontal and vertical lines
    const lines = computeLines(edges);
    console.log(lines.length);

    // Compute bounding box
    return {
	corners: boundingBox(lines),
	result: edges
    };
};

module.exports = img => {
    const original = img.copy();

    // Draw bounding box
    const {corners, result} = boxDocAllImage(img);
    const {topCorner, bottomCorner} = corners;
    if (isFinite(topCorner.x) && isFinite(topCorner.y) && isFinite(bottomCorner.x) && isFinite(bottomCorner.y)) {
	console.log(topCorner);
	console.log(bottomCorner);
	original.drawRectangle(topCorner, bottomCorner, new cv.Vec(0, 253, 150), 5);
	// Crop result
	width = bottomCorner.x - topCorner.x;
	height = bottomCorner.y - topCorner.y;
	boxed = img.getRegion(new cv.Rect(topCorner.x, topCorner.y, width, height));
	return original;
	// return boxed;
    } else {
	console.log("Cannot find any important contour!");
	return original;
    }
};
