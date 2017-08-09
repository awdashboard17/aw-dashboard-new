var myApp = angular.module('myApp', []);

myApp.controller('productCtrl', ['$scope', '$http', function ($scope, $http)
{
   $scope.addProductControls = true;
   $scope.addProductButton = true;
   $scope.awproducts = [];
   $scope.productStatus = "";
   $scope.clients = [];
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
        myclients = [];
        myclients.awproducts = [];
        myclients.awversions = [];
        awproducts = [];
        var iter;
        $http.get('/getAllProducts').success(function (response)
        {
            console.log(" Received from database : getAllProducts : ");
            console.log("response : " + response);
            awproducts = response;

            for(iter=0; iter<awproducts.length; ++iter)
            {
                console.log("awproducts[" + iter + "] : " + awproducts[iter]);
                myclients.awproducts[iter] = awproducts[iter];
            }
        });
        $scope.clients = myclients;
    };

    console.log("-------------calling refresh-------------");
    refresh();

    $scope.BringBackProducts = function ()
    {
        refresh();
    }

    //function to save all form elements
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
                    break;
                }
            }

            console.log("proceed value : " + proceed)

            //product doesnt exists. creating new one.
            if(proceed)
            {
                var prodname = $scope.formInfo.productname;
                console.log("prodname : " + prodname);
                console.log("$$$$$$$$$$$$$$$$$$");

                $http.post('/addProduct', $scope.formInfo).success(function (response)
                {
                    console.log("Success Message for addProduct : " + response);
                    refresh();
                    $scope.productStatus = 'Product added successfully';

/*

                    var prefs = [];
                    prefs.push('');
                    console.log("************ Setting Preferences ***********");
                    console.log("productname : " + productname);



                     $http.get('/getAllProducts').success(function (response)
                    {
                        console.log(" Received from database : getAllProducts : ");
                        console.log("response : " + response);

                        for(index in response)
                        {
                            myprod = response[index];
                            console.log("this a Product! "+ myprod);
                            if(productname === myprod)
                            {
                                product_index = index;
                                console.log("product_index : " + product_index);
                                break;
                            }
                        }

                        var pni = productname + ":" + (product_index);
                        console.log("pni in addproduct %%%%% : " + pni);

                        $http.post('/setPreferences/' + pni, prefs).success(function (response)
                        {
                            console.log("Success Message for setPreferences : " + response);
                        });
*/                       

                        $scope.formInfo = "";
                    });

                //});
            }

        });
    };

    //function to add new version to a product
    $scope.addProductVersion = function (product)
    {
        console.log("in addProductVersion function : ");

        $scope.selProductVersionRequired = '';
        $scope.productVersionRequired = '';

        var proceed = false;
        var myprod = '';
        var product_index;


        if (!product) {
            $scope.selProductVersionRequired = 'Select Product to add version';
        }
        if (!$scope.formInfo.productversion) {
            $scope.productVersionRequired = 'Product Version Required';
        }

        console.log("product : " + product);
        console.log("version : " + $scope.formInfo.productversion);

        // get the product index.
        $http.get('/getAllProducts').success(function (response)
        {
            console.log(" Received from database : getAllProducts : ");
            console.log("response : " + response);

            for(index in response)
            {
                myprod = response[index];
                console.log("this a Product! "+ myprod);
                if(product === myprod)
                {
                    product_index = index;
                    console.log("product_index : " + product_index);
                    break;
                }
            }

            var pni = product + ":" + product_index;
            console.log("pni : " + pni);

            $http.post('/addVersion/' + pni, $scope.formInfo).success(function (response)
            {
                console.log("Success Message: ");
                refresh();
                $scope.productStatus = 'Product added successfully';
                $scope.formInfo = "";
            });
            
        });

    };



/*
$scope.remove = function (username)
{
    console.log(username);
    if(username != 'admin')
    {
        var deleteUser = $window.confirm('Are you sure to remove the user?');
        if(deleteUser)
        {
            $http.delete('/adminUsers/' + username).success(function (response)
            {
                refresh();
                $scope.formInfo = "";
                $scope.userStatus = "User removed successfully !!!";
            });
        }
    }
    else
    {
        $scope.userStatus = "You cannot remove \'admin\' user !!!";
    }
};

$scope.edit = function (username)
{
    console.log('username to edit ' + username);
    document.getElementById("userName").readOnly = true;
    $http.get('/adminUsers/' + username).success(function (response)
    {
    $scope.formInfo = response;
    });
};  

$scope.update = function ()
{
    console.log("in update function : RegisterUserjs");
    $http.put('/adminUsers/' + $scope.formInfo.username, $scope.formInfo).success(function (response)
    {
    refresh();
    $scope.formInfo = "";
    $scope.userStatus = "User updated successfully !!!";
    document.getElementById("userName").readOnly = true;
    })
};
*/
}]);
