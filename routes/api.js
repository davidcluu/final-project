exports.getLegislator = function(req, res) {
    var http = require('http');
    url = "http://congress.api.sunlightfoundation.com/legislators?chamber=house&district="
    + req.body.district
    + "&apikey=2ba76c94bc2541eca760598a23f940a7";

	// get is a simple wrapper for request()
	// which sets the http method to GET
	var legislatorReq = http.get(url, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event    
    	var buffer = "", 
        	data,
        	result;

    	response.on("data", function (chunk) {
        	buffer += chunk;
    	}); 
    	
    	response.on("end", function (err) {
        // finished transferring data
        // dump the raw data
        	data = JSON.parse(buffer);
        	result = data.results[0];
        	res.json({ "legislator" : result });
    	}); 
	});
}

exports.getLegContributions = function(req, res) {
	var http = require('http');
    console.log("hello");
	url = "http://www.opensecrets.org/api/?output=json&method=candContrib&cid="
	+ "N00007360"
	+ "&cycle=2016&apikey=e5737fa3e47b3dd090dab498c94e3f08";

	var contributorReq = http.get(url, function (response) {
       
    	var buffer = "", 
        	data,
        	result;

    	response.on("data", function (chunk) {
        	buffer += chunk;
    	}); 
    	
    	response.on("end", function (err) {
            console.log(buffer);
            console.log("\n");
        	data = JSON.parse(buffer);
        	console.log(data);
    	});
    	console.log("world");
	});
}