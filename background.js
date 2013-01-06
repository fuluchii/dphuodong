
var shop;
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if(request.sender=="contentscript"){
			shop=request.body;
		}else if(request.sender=="popup"){
			sendResponse(shop);
		}

	});