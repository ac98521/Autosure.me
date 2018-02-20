var http = require('http');

//http://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/serialnumber=123795ph1.list/byjson
var options = {
  host: 'bluepages.ibm.com',
  path: '/BpHttpApisv3/slaphapi?ibmperson/serialnumber=147655ph1.list/byjson'
};

callback = function(response) {
  var str = '';
	
  console.log(response.statusCode);
  response.setEncoding("utf8");
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
	console.log(req);
  });
}

var req = http.request(options, callback).end();