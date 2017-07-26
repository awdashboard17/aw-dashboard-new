var myApp = angular.module('myApp', []);

myApp.controller('ConfigureCtrl', ['$scope', '$http', function ($scope, $http)
{
      //function to get all collections
      $scope.BringBackBaseLines = function ()
      {
        console.log("In BringBackBaseLines");
        $scope.myReleases = [];
        $http.get('/getAllReleases').success( function ( response )
        {
           console.log("getAllReleases successful");
           $scope.myReleases = response;
        });
      };

      $scope.selected = [];

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
          angular.forEach($scope.myReleases, function(item)
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
 
      $scope.saveConfiguration = function()
      {
          console.log("In Save Configuration");
          $scope.selected.sort();
          $http.post('/setPreferences', $scope.selected).success(function (response)
          {
              $scope.configStatus = "User preferences saved successfully !!!";
          })
      };

}]);
