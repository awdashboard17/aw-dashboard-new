var myApp = angular.module( 'myApp', [] );
myApp.controller('AppCtrl', ['$scope', '$http','$window', function ($scope, $http, $window)
{
    console.log("This is Controller");

    var refresh = function ()
    {
        $http.get('/awteam').success(function (response)
        {
            console.log(" Received from database");
            $scope.awteam = response;
            $scope.teams = "";
        });
    };

    refresh();

    $scope.addRecord = function ()
    {
      console.log($scope.teams);
      $http.post('/awteam', $scope.teams).success(function (response)
      {
        console.log(response);
        refresh();
      });
    };

    $scope.remove = function (id )
    {
        var deleteUser = $window.confirm('Are you sure to remove the record?');
        if(deleteUser)
        {
            console.log(id);
            $http.delete('/awteam/' + id).success(function (response)
            {
                refresh();
            });
        }
    };

    $scope.edit = function (id)
    {
      console.log('tag id ' + id);
      $http.get('/awteam/' + id).success(function (response)
      {
        $scope.teams = response;
      });
    };  

    $scope.update = function ()
    {
      console.log( $scope.teams.Team );
      $http.put('/awteam/' + $scope.teams.Team, $scope.teams).success(function (response)
      {
        refresh();
      })
    };

    $scope.deselect = function ()
    {
      $scope.teams = "";
    }

}]);