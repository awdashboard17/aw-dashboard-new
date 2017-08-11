  var myApp = angular.module('myApp', []);

  myApp.controller('ConfigureCtrl', ['$scope', '$http', function ($scope, $http)
  {
        $scope.clients = [];
        $scope.selected = [];

        $scope.getProductVersions =function( product )
        {
          $http.get('/getAllProductsVersions/' + $scope.selectedRequest.product).success(function (response)
          {
              console.log(" Received from database : getAllProductsVersions : ");
              console.log("response : " + response[0].versions);
              //$scope.clients.productversions = response[0].versions;
              $scope.clients.myReleases = response[0].versions;
              
              $http.get('/getPreferenceOfProduct/' + $scope.selectedRequest.product).success( function ( response )
              {
                  console.log("getPrefReleasesOfProduct successful");
                  console.log("response : " + response[0].preference);
                  $scope.selected = response[0].preference;
              });
          });

        };

        $scope.BringBackProducts = function ()
        {
            console.log("In BringBackProducts");
            var prodversions = [];
            var pni;

            $http.get('/getAllProducts').success( function ( response )
            {
              console.log("getAllProducts successful");
              $scope.clients.myProducts = [];
              $scope.clients.myProducts = response;

              $scope.selectedRequest = {};
              $scope.selectedRequest.product = $scope.clients[0];
              $scope.selectedRequest.product = $scope.clients.myProducts[0];
              console.log("selected product : " + $scope.selectedRequest.product);

              $http.get('/getAllProductsVersions/' + $scope.selectedRequest.product).success(function (response)
              {
                  console.log(" Received from database : getAllProductsVersions : ");
                  console.log("response : " + response[0].versions);
                  //$scope.clients.productversions = response[0].versions;
                  $scope.clients.myReleases = response[0].versions;
                  
                  $http.get('/getPreferenceOfProduct/' + $scope.selectedRequest.product).success( function ( response )
                  {
                      console.log("getPrefReleasesOfProduct successful");
                      console.log("response : " + response[0].preference);
                      $scope.selected = response[0].preference;
                  });
              });
          
          });
        };

        $scope.exist = function(item)
        {
          return $scope.selected.indexOf(item) > -1;
        };

        $scope.toggleSelection = function(item)
        {
          var idx = $scope.selected.indexOf(item);
          if(idx > -1)
          {
            $scope.selected.splice(idx, 1);
          }
          else
          {
            $scope.selected.push(item);
          }
        };

        $scope.checkAll = function()
        {
          if(!$scope.selectAll)
          {
            angular.forEach($scope.clients.myReleases, function(item)
            {
                idx = $scope.selected.indexOf(item);
                if(idx >= 0)
                {
                  return true;
                }
                else{
                        $scope.selected.push(item);
                    }
            })
          }
          else{
                  $scope.selected = [];
                  //$scope.selected.builds = [];
              }
        };
  
        $scope.savePreferences = function()
        {
            console.log("In Save Configuration");
            $scope.selected.sort();
              
            $http.post('/savePreference/' + $scope.selectedRequest.product, $scope.selected).success(function (response)
            {
                $scope.configStatus = "User preferences saved successfully !!!";
            })

        };

  }]);
