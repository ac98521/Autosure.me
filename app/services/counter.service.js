// counter.service.js

(function() {
	
	angular
		.module("myApp")
		.service("CountService", CountService);
	
	CountService.$inject = ["$q", "$http"];
	function CountService($q, $http) {
		var service = {};
		
		service.SetMeetNumber = SetMeetNumber;
		service.OpenConfig = OpenConfig;
		
		function SetMeetNumber(type) {
			var currentDate = new Date();
			var ssType;
			var baseNum
			
			if (type === "Executive") {
				ssType = "EX";
			}
			else {
				ssType = "RT";
			}
			
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1;
			
			return $http.put("/count/" + type).then(function(res) {
				//baseNum = ssType + year + pad(month, 2) + "-" + pad(res.data.seq, 4);
				baseNum = ssType + year + pad(month, 2) + "-" + pad(res.data.value, 4);
				
				return baseNum;
			});
		};

		function OpenConfig(param) {
			return $http.post("/configuration/"+ param)
				.then(function(res) 
				{
					return (res.data.configdocs[0]);
				}, function() {
					return ({status: "fail"});
				});
		}
		
		/*
			Original code from Pointy
			source: "http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript"
		*/
		function pad(n, width, z) {
		  z = z || '0';
		  n = n + '';
		  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}
		
		return service;
	};
})();