function getServiceURI(endpoint) {
    return location.href + endpoint;
}

function sendXhr(imageData, endpoint, onResult) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(err) {
	if (xhr.readyState == 4)  {
	    if (xhr.status == 202) {
		const response = JSON.parse(xhr.responseText);
		const base64Data = response.base64Data;
		if ('detectedText' in response) {
		    onResult(null, 'data:image/jpeg;base64,' + base64Data, response.detectedText);
		} else {
		    onResult(null, 'data:image/jpeg;base64,' + base64Data, null);
		}
	    } else {
		onResult(xhr.status + ': ' + xhr.responseText, null, null);
	    }
	}
    };

    xhr.open('POST', getServiceURI(endpoint), true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ imgBase64 : imageData }));
}
