const cv = require('opencv4nodejs');

function findMRZ(file){
	let workFile = __dirname+'/orig/'+file;
	let saveFile = __dirname+'/tmp/'+file;
	const mat = cv.imread(workFile);

	let kernelSize = new cv.Size(13, 5)
	let rectKernel = cv.getStructuringElement(cv.MORPH_RECT, kernelSize)

	let grey = mat.cvtColor(cv.COLOR_BGR2GRAY);

	grey = grey.gaussianBlur(new cv.Size(3, 3), 0);
	let blackhat = grey.morphologyEx(rectKernel, cv.MORPH_BLACKHAT);


	let gradX = blackhat.sobel(cv.CV_32F,1,0,-1);

	gradX = gradX.abs();

	// ORIG FUNC IN PYTHON
	//(minVal, maxVal) = (np.min(gradX), np.max(gradX))
	let { minVal, maxVal } = gradX.minMaxLoc();    // ok

	// ORIG FUNC IN PYTHON
	//gradX = (255 * ((gradX - minVal) / (maxVal - minVal))).astype("uint8")

	let minValMat = new cv.Mat(gradX.rows, gradX.cols, gradX.type, minVal);
	let maxValMat = new cv.Mat(gradX.rows, gradX.cols, gradX.type, maxVal);

	let v1 = gradX.sub(minValMat);
	let v2 = maxValMat.sub(minValMat);
	let v3 = v1.hDiv(v2);
	//let v4 = v3.mul(255);   // ?????? strange moment - (255 * v3).astype("uint8")
	gradX = v3;

	cv.imshow('nodejs gradX', gradX);

	gradX = gradX.morphologyEx(rectKernel, cv.MORPH_CLOSE);
	//cv.imshow('nodejs gradX', gradX);

	console.log('THRESH_BINARY =',cv.THRESH_BINARY) // should be 0
	console.log('THRESH_OTSU =',cv.THRESH_OTSU) // should be 8
	console.log('THRESH_BINARY | THRESH_OTSU =',cv.THRESH_BINARY | cv.THRESH_OTSU);
	// ERROR FUNC
	let thresh = gradX.threshold(0,255,8);
	//cv.imshow('nodejs thresh', thresh);

	//cv.imwrite(saveFile, mat);
	cv.waitKey();
	return saveFile;
}

console.log('--------------start-------------');

findMRZ('1_600.jpg');
//testFile('1.png');
