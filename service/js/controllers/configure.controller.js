var app = angular.module('AF');

app.controller('configureCtrl', function ($scope, close, client, TestsResource) {
	$scope.allTests = [];
	$scope.selectedTests =[];
	$scope.close = close;
	$scope.client = client;
	$scope.variables = [];
	$scope.currentTest = null;
	$scope.filterText = "";

	$scope.loadAllTests = function() {
		TestsResource.query(function(tests){
			angular.forEach(tests, function(t){
				var test = JSON.parse(t);
				$scope.allTests.push(test);
			});
		});
	}

	$scope.findOne = function(ipAddress) {
		TestsResource.query({ip: ipAddress}, function(tests){
			angular.forEach(tests, function(t){
				var test = JSON.parse(t);
				$scope.selectedTests.push(test);
			});
		});
	}

	$scope.addTest = function() {
		var rank = $scope.selectedTests.length + 1;
		var copy = angular.extend({}, $scope.currentTest);
		for(var i =0; i < $scope.variables.length; i ++ ) {
			for(var j = 0; j < copy.commands.length; j ++ ) {
				if(copy.commands[j].lastIndexOf('${', 0) === 0 && copy.commands[j].lastIndexOf('Echo') > 1) {
					copy.commands[j] = copy.commands[j].replace(new RegExp(
							'Echo ' + $scope.variables[i].old, 'g'),'Echo ' + $scope.variables[i].value);
				}
			}
		}
		copy.name = copy.name + '-' + rank
		$scope.selectedTests.push(copy);
	}

	$scope.removeTest = function(test) {
		for( var i= 0 ; i < $scope.selectedTests.length; i ++){
			if (test.name == $scope.selectedTests[i].name)
				$scope.selectedTests.splice(i,1);
		};
	}

	$scope.selectTest = function(test) {
		$scope.currentTest = test;
		$scope.updateVariablesForTest();
	}

	$scope.updateVariablesForTest = function() {
		$scope.variables = [];
		var commands = [];
		if($scope.currentTest) commands = $scope.currentTest.commands;
		for (var i =0 ; i < commands.length; i ++ ) {
			var c = commands[i];
			if(commands[i].lastIndexOf('${', 0) === 0 && commands[i].lastIndexOf('Echo') > 1) {
				var value = commands[i].split('Echo')[1].trim();
				var v = {name: commands[i].split('=')[0], value: value, old: value};
				$scope.variables.push(v);
			}
		}
	}

	$scope.save = function() {
		TestsResource.update({ip: client.ip, config: JSON.stringify($scope.selectedTests)}, function(result){
			$scope.message = result.message;
		});
	}
    
    $scope.filterTests = function(test) {
    	if($scope.filterText.length == 0) return true;
    	var regExp = new RegExp($scope.filterText, "i");
    	return test.name.match(regExp);
    }
	$scope.loadAllTests();
	$scope.findOne(client.ip);
});