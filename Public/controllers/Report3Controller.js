    var myApp = angular.module('myApp', []);

    myApp.controller('Report3Ctrl', ['$scope', '$http', '$window', function ($scope, $http, $window)
    {
      $scope.clients = [];
      $scope.clients.awproducts = [];

      $scope.BringBackBaseLines = function()
      {
        console.log("In the show report 2");

        $http.get('/getAllProducts').success(function (response)
        {
            console.log(" Received from database : getAllProducts : ");
            //console.log("response : " + response);

            $scope.clients.awproducts = response;
            $scope.selectedRequest = {};
            console.log("$scope.clients.awproducts[0] : " + $scope.clients.awproducts[0]);
            $scope.selectedRequest.awproduct = $scope.clients.awproducts[0];

            $http.get('/getPreferenceOfProduct/' + $scope.selectedRequest.awproduct).success( function ( response )
            {
                console.log("BringBackReleases successful");
                //console.log("response : " + response[0].preference);

                $scope.clients.awreleases = [];
                $scope.clients.awreleases = response[0].preference;
                $scope.selectedRequest.awrelease = $scope.clients.awreleases[0];
                console.log($scope.selectedRequest.awrelease);

                $http.get('/getBuildsOf/' + $scope.selectedRequest.awrelease).success( function ( response )
                {
                    console.log("getBuildsOf successful");
                    //console.log("response : " + response);
                    $scope.clients.awbuilds = [];
                    $scope.clients.awbuilds = response;
                    $scope.selectedRequest.awbuild = $scope.clients.awbuilds[0];

                    var rnb = $scope.selectedRequest.awrelease+":"+$scope.selectedRequest.awbuild;
                    console.log("rnb : " + rnb);

                    $http.get('/getTeamsOfBuild/' + rnb).success( function ( response )
                    {
                        //console.log("TEAMS : " + response.values);
                        var teams = [];
                        teams = response.values;
                        $scope.clients.awteams = [];
                        $scope.clients.awteams =  teams;
                        $scope.selectedRequest.awteam = $scope.clients.awteams[0];

                        var rbnt = $scope.selectedRequest.awrelease + ":" + $scope.selectedRequest.awbuild + ":" + $scope.selectedRequest.awteam ;
                        if (!JSON.parse(sessionStorage.getItem(rbnt)))
                        {
                            getPageData($scope.selectedRequest.awrelease, $scope.selectedRequest.awbuild, $scope.selectedRequest.awteam);
                        }                        
                        else
                            printReport3(rbnt);
                       
                    });

                });

            });
        });
      };


      // This function is to populate the data for a particular release, build and team in Report2 format
      var getPageData = function( release, build, team )
      {
        console.log("*** IN getPageData ***");
        var rbnt = release + ":" + build + ":" + team ;
        console.log("rbnt : " + rbnt);

/*
        var rnb = release + ":" + build;
        $http.get('/getDistErrorstepsOfBuild/' + rnb).success( function ( response )
        {
            console.log("getDistErrorstepsOfBuild successful");
            //console.log("response : " + response.values);
            var errorstepsArray = [];
            errorstepsArray = response.values;
            //remove empty element
            var index = errorstepsArray.indexOf('');
            if (index > -1) {
                errorstepsArray.splice(index, 1);
            }
            console.log("after : " + errorstepsArray);
        });
*/


        // This set is use to collect all the releases for selected rel, build and team. e.g. Tc1123, Tc1140 etc.
        var tcverSet = new Set();
        $http.get('/getResultsOfBuild/' + rbnt).success( function ( response )
        {
            //console.log("+++++++++++++++++++++ getResultsOfBuild successful");
            //console.log("response : " + response);
            //console.log("response length : " + response.values.length);

            // resultsArray is the having results field of documents queried from the database.
            var resultsArray = [];
            var tempArray =[];
            for(index in response)
            {
                console.log(response[index].results);
                resultsArray = tempArray.concat(response[index].results);
                tempArray =  resultsArray;
            }

            //console.log("resultsArray : " + resultsArray);
            
            var resultDetails;
            var splash;
            var teamwiseKeyObj;

            //associative array
            var myArray = new Object();

            //console.log("pushing for Team : " + team);
            for(index in resultsArray)
            {
                //get the results record in resultDetails
                resultDetails = resultsArray[index];
                //console.log("=========================================================================");
                //console.log("build id : " + resultDetails.build_id);
                splash = resultDetails.build_id.split("_");
                var myTcversion = splash[2];
                for (var i=3; i<splash.length; ++i) 
                    myTcversion = myTcversion + "_" + splash[i];

                // If team is same as the team selected by user.
                if(team === resultDetails.Team)
                {
                    console.log("=========================================================================");
                    console.log("build id : " + resultDetails.build_id);
                    console.log("tc version : " + myTcversion);
                    console.log("result : " + resultDetails.result);
                    //console.log("+++++++++++++++ team : " + team);
                    //console.log("+++++++++++++++ resultDetails.Team : " + resultDetails.Team);

                    // Form key object to store each row in report3
                    teamwiseKeyObj = '';
                    teamwiseKeyObj = release+"^^^"+build+"^^^"+team;
                    console.log("--------------------------------------------------");
                    console.log("teamwiseKeyObj : " + teamwiseKeyObj);
                    
                    tcverSet.add(myTcversion);

                    var errorstep = resultDetails.errorstep;
                    myTcArray = myArray[errorstep];
                    if(!myTcArray)
                    {
                        var myTcArray = new Object();
                        myTcArray[myTcversion] = 0;
                    }
                    else
                    {
                        var keys = Object.keys(myTcArray);
                        var found = findObjInArray(keys, myTcversion);
                        if(!found)
                        {
                            myTcArray[myTcversion] = 0;
                        }
                    }

                    if(resultDetails.result==='failed')
                    {
                        console.log("myTcArray is null : failed");
                        console.log("incrementing count : myTcArray[" + myTcversion + "] = 1");
                        var count = myTcArray[myTcversion];
                        myTcArray[myTcversion] = ++count;
                        myArray[errorstep] = myTcArray;
                    }

                }
            }

            $window.sessionStorage.setItem(rbnt+"Report3",JSON.stringify(myArray));
            var tcVersionArray = Array.from(tcverSet);
            tcVersionArray.sort();
            console.log("after sorting tcVersionArray : " + tcVersionArray);
            $window.sessionStorage.setItem(rbnt+"tcSet"+"Report3",JSON.stringify(tcVersionArray));
            printReport3(rbnt);
                                
        });
            
    }

      $scope.refreshReport3 = function( release, build, team )
      {
        console.log("*** IN refreshReport3 ***");
        var rbnt = release + ":" + build + ":" + team ;
        //console.log("rbnt : " + rbnt);
        var myArray = JSON.parse(sessionStorage.getItem(rbnt+"Report3"));
        if (!myArray)
        {
            //console.log("Creating Data for 1st time for team : " + team);
            getPageData(release, build, team);
        }
        else
        {
            //console.log("Getting from session object");
            printReport3(rbnt);
        }
      };

   // function to find object in an array.
    function findObjInArray(arr, obj) {
        for(var i=0; i<arr.length; i++) {
            if (arr[i] === obj) return true;
        }
        return false;
    }

    // function to print the report2
    var printReport3 = function( rbnt )
    {
        console.log("*** IN printReport3 ***");
        //Get the stored report3 item from sessionstorage
        var myArray = JSON.parse(sessionStorage.getItem(rbnt+"Report3"));
        var tcVersionArray = JSON.parse(sessionStorage.getItem(rbnt+"tcSet"+"Report3"));
        console.log("tcVersionArray : " + tcVersionArray);

        //report3Array for storing row values. tcHeaderArray to store header values of report
        var report3Array = [];
        var tcHeaderArray = [];
        var splash, splash2;

        for(var key in myArray)
        {
            console.log("*(myArray - key : " + key + " )*");
            var errorstep = key;
            //splash = key.split("^^^");
            //var application = splash[3];

            // Pushing count 0 for rows which dont have [errosteps + tcrelease]
            var myTcArray = [];
            myTcArray = myArray[key];
            for (var i = 0; i < tcVersionArray.length; i++) 
            {
                var tcKeysTempArray = Object.keys(myTcArray);
                //console.log("tcKeysTempArray : " + tcKeysTempArray);
                console.log("checking for findObjInArray(" + tcKeysTempArray + ", OBJECT - " + tcVersionArray[i] + ")");
                if(!findObjInArray(tcKeysTempArray, tcVersionArray[i]))
                {
                    console.log("element not present. pushing myTcArray[" + tcVersionArray[i] + "] = 0");
                    myTcArray[tcVersionArray[i]] = 0;
                }
            }

            if(myTcArray)
            {
                var tcValuesArray = [];
                var sorted_keys = Object.keys(myTcArray).sort();
                for(i=0; i<sorted_keys.length; ++i)
                {
                    console.log(">>>>>>>>>>> : " + sorted_keys[i] + " : " + myTcArray[sorted_keys[i]]);
                    var value = myTcArray[sorted_keys[i]];
                    console.log("myTcArray[" + sorted_keys[i] + "] = " + value);
                    tcValuesArray.push(value);
                }

                console.log(">>>>>>>>>>>> : before reverse tcValuesArray : " + tcValuesArray);
                tcValuesArray.reverse();
                console.log(">>>>>>>>>>>> : after reverse tcValuesArray : " + tcValuesArray);

                //push values for tcresults only if it has failed values.
                report3Array.push({feature: 'NA', errorstep: errorstep, tcvalues: tcValuesArray});
                console.log("pushing : " + errorstep + ":" + tcValuesArray);
            }
        }
        tcVersionArray.reverse();
        $scope.clients.tcHeaderArray2 = Array.from(tcVersionArray);
        console.log("MYtcVersionArray : " + $scope.clients.tcHeaderArray2);
        for(var i=0; i<tcVersionArray.length; ++i)
        {
            var splash = tcVersionArray[i].split('_');
            tcVersionArray[i] = splash[0];
        }
        console.log("+++++++++++++ : after reverse tcHeaderArray : " + tcVersionArray);
        $scope.clients.tcHeaderArray = tcVersionArray;
        $scope.clients.report = report3Array;
    }


      $scope.changeProductVersionsOf = function( product )
      {
        $http.get('/getPreferenceOfProduct/' + product).success( function ( response )
        {
            console.log("getProductVersionsOf successful");
            console.log("response : " + response[0].preference);
            $scope.clients.awreleases = response[0].preference;
            $scope.selectedRequest.awrelease = $scope.clients.awreleases[0];
        });
      };

      $scope.changeBuildsOfRelease = function( release )
      {
        $http.get('/getBuildsOf/' + release).success( function ( response )
        {
            console.log("response : " + response);
            $scope.clients.awbuilds = [];
            $scope.clients.awbuilds = response;
            $scope.selectedRequest.awbuild =  $scope.clients.awbuilds[0];
        });
      };

      $scope.changeTeamsOfBuild = function( release, build )
      {
        var rnb = release + ":" + build;
        $http.get('/getTeamsOfBuild/' + rnb).success( function ( response )
        {
            console.log("getTeamsOfBuild successful");
            $scope.clients.awteams = [];
            $scope.clients.awteams =  response.values;
            $scope.selectedRequest.awteam = $scope.clients.awteams[0];
        });
      };

  }]);
