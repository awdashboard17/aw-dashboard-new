
var myApp = angular.module('myApp', []);

myApp.controller('ReportsCtrl', ['$scope', '$http', function ($scope, $http)
  {
      //function to get all collections
      $scope.BringBackBaseLines = function ()
      {
        console.log("In BringBackBaseLines");

          $http.get('/getAllCollections').success( function ( response )
          {
            console.log("BringBackBaseLines successful");
            console.log(response);
            $scope.reports2 = [];
            $scope.reports2 = response;

            //console.log($scope.clients[0]);
            //$scope.selectedRequest = {};
            //$scope.selectedRequest.release = $scope.clients[0];
          });

      };
}]);
