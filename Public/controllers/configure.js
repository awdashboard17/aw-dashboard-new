var myApp = angular.module('myApp', []);

myApp.controller('ConfigureCtrl', ['$scope', '$http', function ($scope, $http)
{
      $scope.clients = [];
      $scope.selected = [];

      $scope.getProductVersions =function( product )
      {

        // get the product index.
        $http.get('/getAllProducts').success(function (response)
        {
            console.log(" Received from database : getAllProducts : ");
            console.log("response : " + response);

            for(index in response)
            {
                myprod = response[index];
                console.log("myprod : "+ myprod);
                if(product === myprod)
                {
                    product_index = index;
                    console.log("product_index : " + product_index);
                    break;
                }
            }

//            var pni = product + ":" + product_index;

            $http.get('/getAllProductsVersions/' + product).success( function ( response )
            {
                console.log("getAllProductsVersions successful");
                console.log("response : " + response);
                //console.log("this is 2 : " + response[0].products[0].AW.versions);
                //if product name starts with numeric then below statement errors out.
                eval("var prodversions = response[0].products[" + product_index + "]." + product + ".versions");

                $scope.clients.myReleases = prodversions;

                console.log("$scope.selectedRequest.product : " + product);

                $http.get('/getPrefReleasesOfProduct/' + product).success( function ( response )
                {
                    console.log("getPrefReleasesOfProduct successful");
                    console.log("response : " + response);

                    $scope.selected = response;
                });

            });


/*


            $http.get('/getAllProductsVersions/' + pni).success( function ( response )
            {
                console.log("response : " + response);
                $scope.clients.myReleases = [];
                $scope.clients.myReleases = response;
                
                    $http.get('/getPrefReleasesOfProduct/' + product).success( function ( response )
                    {
                        console.log("getPrefReleasesOfProduct successful");
                        console.log("response : " + response);
                        $scope.selected = response;
                    });
            });

*/            

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
/*
            $http.get('/getAllProducts').success(function (response)
            {
                console.log(" Received from database : getAllProducts : ");
                console.log("response : " + response);
*/
                for(index in response)
                {
                    myprod = response[index];
                    console.log("this a Product! "+ myprod);
                    if($scope.selectedRequest.product === myprod)
                    {
                        product_index = index;
                        console.log("product_index : " + product_index);
                        break;
                    }
                }

                pni = $scope.selectedRequest.product + ":" + product_index;

                $http.get('/getAllProductsVersions/' + pni).success( function ( response )
                {
                    console.log("getAllProductsVersions successful");
                    console.log("response : " + response);
                    //console.log("this is 2 : " + response[0].products[0].AW.versions);
                    eval("prodversions = response[0].products[" + product_index + "]." + $scope.selectedRequest.product + ".versions;");

                    $scope.clients.myReleases = prodversions;

                    console.log("$scope.selectedRequest.product : " + $scope.selectedRequest.product);

                    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
                    console.log("pni : " + pni);

                    $http.get('/getPrefReleasesOfProduct/' + $scope.selectedRequest.product).success( function ( response )
                    {
                        console.log("getPrefReleasesOfProduct successful");
                        console.log("response : " + response);

                        $scope.selected = response;
                    });

               // });

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
 
      $scope.saveConfiguration = function()
      {
          console.log("In Save Configuration");
          $scope.selected.sort();
/*
        $http.get('/getAllProducts').success(function (response)
        {
            console.log(" Received from database : getAllProducts : ");
            console.log("response : " + response);

            for(index in response)
            {
                myprod = response[index];
                console.log("this a Product! "+ myprod);
                if($scope.selectedRequest.product === myprod)
                {
                    product_index = index;
                    console.log("product_index : " + product_index);
                    break;
                }
            }

          var pni = $scope.selectedRequest.product + ":" + (product_index);
          console.log("pni : "+ pni);
*/            
          $http.post('/setPreferences/' + $scope.selectedRequest.product, $scope.selected).success(function (response)
          {
              $scope.configStatus = "User preferences saved successfully !!!";
          })

        //});

      };

}]);
