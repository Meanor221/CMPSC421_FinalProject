function gettool(req, res) {
	var filename = gettool.root + req.path;

	res.sendFile(filename, function (err) {
		// Log any error.
		if (err) {
			console.log(err);
			// Set the error status for the client and end.
			res.status(err.status).end();
		}

		// If there was no error...
		else {
			// Log the name of the file that was successfully sent.
			console.log("Sent:", req.path);
		}
	});
}

function posttool(req, res) {
	console.log("ID: " + req.body.amazonID);
	console.log("KEY: " + req.body.amazonKey);
	console.log("SEARCH: " + req.body.amazonSearch);

	//Amazon
	amazonSearch();
	response = res;
	setTimeout(function () {
		if (control == "NOT DONE")
			searchResult = "Connection to AWS timed out";
		response.send(searchResult);
		control = "NOT DONE";
	}, 700);
}

exports.gettool = gettool;
exports.posttool = posttool;