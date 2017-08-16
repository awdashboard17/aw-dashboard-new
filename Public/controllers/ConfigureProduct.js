    var myApp = angular.module('myApp', []);

    myApp.controller('productCtrl', ['$scope', '$http', '$window', function ($scope, $http, $window)
    {
    $scope.formInfo = {};

    $scope.addProductControls = true;
    $scope.addProductButton = true;
    
    $scope.productStatus = "";
    $scope.clients = [];
    $scope.clients.awproducts = [];
    $scope.clients.productversions = [];
    productsInfo = [];
    
    $scope.addProduct = function(param)
    {
            $scope.addProductControls = param;
            $scope.addProductButton = param;
            $scope.updateProductControls = false;
            $scope.addVersionButton = false;
            $scope.productStatus = "";
            $scope.productNameRequired = '';
            $scope.productVersionRequired = '';
    }

    $scope.updateVersions = function(param)
    {
            $scope.addProductControls = false;
            $scope.updateProductControls = param;
            $scope.addSelectLabel = param;
            $scope.addSelectProduct = param;
            $scope.addProductButton = false;
            $scope.addVersionButton = param;
            $scope.productStatus = "";
            $scope.productNameRequired = '';
            $scope.productVersionRequired = '';

    }

        $scope.clear = function ()
        {
        $scope.formInfo = "";
        $scope.productStatus = "";
        }

        var refresh = function ()
        {
            console.log("&&&&&&&&&&&&&&&& IN REFRESH &&&&&&&&&&&&&&&");
            var prodversions = [];
            $scope.productStatus = '';

            $http.get('/getAllProducts').success(function (response)
            {
                console.log(" Received from database : getAllProducts : ");
                console.log("response : " + response);
                //awproducts = response;
                $scope.clients.awproducts = response;
                $scope.selectedRequest = {};
                $scope.selectedRequest.awproduct = $scope.clients.awproducts[0];
                $http.get('/getAllProductsVersions/' + $scope.selectedRequest.awproduct).success(function (response)
                {
                    console.log(" Received from database : getAllProductsVersions : ");
                    console.log("response : " + response);
                    $scope.clients.productversions = response[0].versions;
                });
            });
        };

        $scope.getNewProductVersions = function( product )
        {
            $http.get('/getAllProductsVersions/' + product).success( function ( response )
            {
                console.log(" Received from database : getAllProductsVersions : ");
                console.log("response : " + response);
                $scope.clients.productversions = response[0].versions;
            });
        };

        $scope.BringBackProducts = function ()
        {
            refresh();
        }

        $scope.addNewProduct = function ()
        {
            console.log("in addNewProduct function : ");
            console.log($scope.formInfo);

            $scope.productNameRequired = '';
            $scope.productVersionRequired = '';

            if (!$scope.formInfo.productname) {
                $scope.productNameRequired = 'Product Name Required';
            }

            var productname = $scope.formInfo.productname;

            $http.get('/getAllProducts').success(function (response)
            {
                console.log(" Received from database : getAllProducts : ");
                //console.log("response : " + response);

                var proceed = true;
                //console.log("initial proceed value : " + proceed)

                //check if product already exists
                for(index in response)
                {
                    myprod = response[index];
                    //console.log("this a Product! "+ myprod);
                    if($scope.formInfo.productname === myprod)
                    {
                        proceed = false;
                        console.log("product already present : changing proceed value to " + proceed)
                        $scope.productStatus = 'Product already present !!!';
                        break;
                    }
                }

                console.log("proceed value : " + proceed)

                //product doesnt exists. creating new one.
                if(proceed)
                {
                    var prodname = $scope.formInfo.productname;
                    $http.post('/addProduct', $scope.formInfo).success(function (response)
                    {
                        refresh();
                        $scope.productStatus = 'Product added successfully';
                        $scope.formInfo = "";
                    });
                }
            });
        };

        //function to add new version to a product
        $scope.addProductVersion = function (product)
        {
            console.log("in addProductVersion function : ");

            $scope.selProductVersionRequired = '';
            $scope.productVersionRequired = '';

            var proceed = true;
            var productversions = [];

            if (!product) {
                $scope.selProductVersionRequired = 'Select Product to add version';
            }
            if (!$scope.formInfo.productversion) {
                $scope.productVersionRequired = 'Product Version Required';
            }

            console.log("product : " + product);
            console.log("version : " + $scope.formInfo.productversion);

            // get the product index.
            $http.get('/getAllProductsVersions/' + product).success( function ( response )
            {
                console.log(" Received from database : getAllProductsVersions : ");
                console.log("response : " + response[0].versions);

                productversions = response[0].versions;

                for(iter=0; iter < productversions.length; ++iter)
                {
                    console.log("product : " + product);
                    console.log("productversions[iter] : " + productversions[iter]);
                    if($scope.formInfo.productversion === productversions[iter])
                    {
                        console.log("productversion already present. making proceed to false");
                        $scope.productStatus = 'Product version already present !!!';
                        $scope.selectedRequest.awproduct = product;
                        proceed = false;
                        break;
                    }
                }

                console.log("Adding productversion : proceed : " +  proceed);
                if(proceed)
                {
                    $http.post('/addVersion/' + product, $scope.formInfo).success(function (response)
                    {
                        console.log("Success Message: ");
                        $scope.productStatus = 'Product version added successfully';
                        $scope.formInfo = "";
                        $http.get('/getAllProductsVersions/' + product).success(function (response)
                        {
                            console.log(" Received from database : getAllProductsVersions : ");
                            console.log("response : " + response);
                            $scope.clients.productversions = response[0].versions;
                        });
                    });
                }
                    
            });

        };

        $scope.removeProduct = function (product)
        {
            console.log("in removeProduct function : ");
            console.log("product : " + product);
            var deleteProduct = $window.confirm('Are you sure to remove the product?');
            if(deleteProduct)
            {
                $http.delete('/delProduct/' + product).success(function (response)
                {
                    refresh();
                    $scope.formInfo = "";
                    $scope.productStatus = "Product removed successfully !!!";
                });
            }
        };

        $scope.removeProductVersion = function (productversion)
        {
            console.log("in removeProductVersion function : ");
            console.log("product : " + $scope.selectedRequest.awproduct);
            var selectedProduct = $scope.selectedRequest.awproduct;
            console.log("productversion : " + productversion);

            var prodandver = selectedProduct + ":" + productversion;
            console.log("prodandver : " + prodandver);

            var deleteProductVersion = $window.confirm('Are you sure to remove the product version?');
            if(deleteProductVersion)
            {
                $http.delete('/delProductVersion/' + prodandver).success(function (response)
                {
                    //refresh();
                    $scope.formInfo = "";
                    $scope.productStatus = "Product version removed successfully !!!";
                    $http.get('/getAllProductsVersions/' + selectedProduct).success(function (response)
                    {
                        console.log(" Received from database : getAllProductsVersions : ");
                        console.log("response : " + response);
                        $scope.clients.productversions = response[0].versions;
                    });

                });
            }
        };
        
        $scope.logout = function(){
            console.log("destroying session object for user admin");
            $window.sessionStorage.removeItem('user');
            var path = "/login.html";
            console.log(path);
            window.location.href = path;
        };

    }]);
