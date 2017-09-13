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

       $scope.s2ab = function (s) {
            if (typeof ArrayBuffer !== 'undefined') {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            } else {
                var buf = new Array(s.length);
                for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }
        }

      $scope.export_table_to_excel = function (id, type, fn) {

            // XLSX comes from the js file; loaded in the directorwise.html page
            // TODO: 1. As a temporary measure add the same functionality to the team page
            //       2. Make the function a part of a directive or a service, for increasing modularity 
            var wb = XLSX.utils.table_to_book(document.getElementById(id), { sheet: "Team Data" });
            var wbout = XLSX.write(wb, { bookType: type, bookSST: true, type: 'binary' });
            var fname = fn || 'Results.' + type;
            try {
                saveAs(new Blob([$scope.s2ab(wbout)], { type: "application/octet-stream" }), fname);
            } catch (e) { if (typeof console != 'undefined') console.log(e, wbout); }
            return wbout;
        }

      $scope.exportTeamData = function () {
            $scope.export_table_to_excel('teamMappingTableContainer', 'xlsx');

        };

      $scope.UpdateTeamMappings = function()
      {
        var username = window.prompt("Enter your username","");
        var password = window.prompt("Enter your password","");
        if ( username == "vikrant" && password == "vikrant")
        {
            alert ("Login successfully");
            var path = "/UpdateTeamMappings.html";
        }
        else
        {
            alert("Invalid username or password");
            var path = "/ShowTeamMappings.html";
        }
        window.location.href = path;   
      };

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
      };

      $scope.logout = function(){
          console.log("destroying session object for user admin");
          $window.sessionStorage.removeItem('user');
          var path = "/login.html";
          console.log(path);
          window.location.href = path;
      };
  }]);