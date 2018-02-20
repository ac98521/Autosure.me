// authentication.service.js

(function() {
	
	angular
		.module("myApp")
		.service('shareService', function () {
		    var service = this;
		    service.setQuote = setQuote;
		    service.getQuote = getQuote;
		    service.setMaker = setMaker;
		    service.getMaker = getMaker;
		    service.setModel = setModel;
		    service.getModel = getModel;
		    service.setYear = setYear;
		    service.getYear = getYear;
		    service.maker = "";
		    service.model = "";
		    service.year = "";

		    //function declarations
			function setQuote() {
				quote = "1";
			}

			function getQuote() {
				return quote;
			}

		    function setMaker(data) {
				maker = data;
			}

			function getMaker() {
				return maker;
			}

			function setModel(data) {
				model = data;
			}

			function getModel() {
				return model;
			}

			function setYear(data) {
				year = data;
			}

			function getYear() {
				return year;
			}

			/*return {
		        setMaker: setMaker,
		        getMaker: getMaker,
		        setModel: setModel,
		        getModel: getModel
			}*/

		});
})();