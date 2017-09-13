var myApp = angular.module('myApp', ['App.filters']);
angular.module('App.filters', []).filter('placeholder', [function () {
    return function (text, placeholder) {

        console.log("****************** IN FILTER *******************");
        console.log("text : " +text);
        if(text === null){
            console.log("NULL VALUE");
            return placeholder;
        }
        console.log("TEXT NOT NULL");
        return text;
    };
}]);

    myApp.controller('Report2Ctrl', ['$scope', '$http', '$window', function ($scope, $http, $window)
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
            //console.log("$scope.clients.awproducts[0] : " + $scope.clients.awproducts[0]);
            $scope.selectedRequest.awproduct = $scope.clients.awproducts[0];

            $http.get('/getPreferenceOfProduct/' + $scope.selectedRequest.awproduct).success( function ( response )
            {
                console.log("BringBackReleases successful");
                //console.log("response : " + response[0].preference);

                $scope.clients.awreleases = [];
                $scope.clients.awreleases = response[0].preference;
                $scope.selectedRequest.awrelease = $scope.clients.awreleases[0];
                //console.log($scope.selectedRequest.awrelease);

                $http.get('/getBuildsOf/' + $scope.selectedRequest.awrelease).success( function ( response )
                {
                    console.log("response : " + response);
                    $scope.clients.awbuilds = [];
                    $scope.clients.awbuilds = response;
                    $scope.selectedRequest.awbuild = $scope.clients.awbuilds[0];

                    var rnb = $scope.selectedRequest.awrelease+":"+$scope.selectedRequest.awbuild;
                    //console.log("rnb : " + rnb);

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
                            printReport2(rbnt);
                    });

                });

            });
        });
      };

      var getPageData = function( release, build, team )
      {
        console.log("*** IN getPageData ***");
        var rbnt = release + ":" + build + ":" + team ;
        //console.log("rbnt : " + rbnt);
        var tcverSet = new Set();
        $http.get('/getResultsOfBuild/' + rbnt).success( function ( response )
        {
            //console.log("+++++++++++++++++++++ getResultsOfBuild successful");
            //console.log("response : " + response);
            //console.log("response length : " + response.values.length);
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
            //console.log("response values length : " + response.values.length);
            var teamwiseKeyObj;
            var teamwiseValObj;

            //associative array
            var myArray = new Object();

            //console.log("pushing for Team : " + team);
            for(index in resultsArray)
            {
                resultDetails = resultsArray[index];
                //console.log("=========================================================================");
                //console.log("build id : " + resultDetails.build_id);
                splash = resultDetails.build_id.split("_");
                var myTcversion = splash[2];
                for (var i=3; i<splash.length; ++i) 
                {  
                    myTcversion = myTcversion + "_" + splash[i];
                } 

                //console.log("tc version : " + myTcversion);
                //console.log("result : " + resultDetails.result);
                //var tcver = "\'" + splash[2] + "\'";
                //console.log("tc version : " + tcver);
                //console.log("application : " + resultDetails.Application);
                //console.log("tags : " + resultDetails.tags);
                //console.log("feature : " + resultDetails.Feature);
                //console.log("scenario : " + resultDetails.Scenario);
                //console.log("failedstep : " + resultDetails.errorstep);
                //console.log(tcver + " : " + resultDetails.result);
                
                if(team === resultDetails.Team)
                {
                    //console.log("+++++++++++++++ team : " + team);
                    //console.log("+++++++++++++++ resultDetails.Team : " + resultDetails.Team);
                    if(resultDetails.errorstep === '')
                        errorstep = 'NA';
                    else
                        errorstep = resultDetails.errorstep;

                    teamwiseKeyObj = '';
                    teamwiseKeyObj = release+"^^^"+build+"^^^"+team+"^^^"+resultDetails.Application+"^^^"+resultDetails.tags+"^^^"+resultDetails.Feature+"^^^"+resultDetails.Scenario;
                    //console.log("--------------------------------------------------");
                    //console.log("teamwiseKeyObj : " + teamwiseKeyObj);
                    
                    teamwiseValObj = myTcversion + ":" + resultDetails.result;
                    tcverSet.add(myTcversion);
                    //console.log("teamwiseValObj : " + teamwiseValObj);
                    var myTcArr = myArray[teamwiseKeyObj];
                    if(! myTcArr)
                    {
                        //console.log("value is null");
                        var myTcArr = new Object();
                        myTcArr[myTcversion] = resultDetails.result + ":" + errorstep;
                        //console.log("pushing element : myTcArr[" + myTcversion + "] = " + resultDetails.result + ":" + errorstep);
                        myArray[teamwiseKeyObj] = myTcArr;
                    }
                    else
                    {
                        //console.log("value already present");
                        myTcArr[myTcversion] = resultDetails.result + ":" + errorstep;
                        //console.log("pushing element : myTcArr[" + myTcversion + "] = " + resultDetails.result + ":" + errorstep);
                        myArray[teamwiseKeyObj] = myTcArr;
                    }
                }
            }

            $window.sessionStorage.setItem(rbnt,JSON.stringify(myArray));
            var tcVersionArray = Array.from(tcverSet);
            //console.log("setting tcversionarray in session : " + tcVersionArray);
            $window.sessionStorage.setItem(rbnt+"tcSet",JSON.stringify(tcVersionArray));
            //console.log("printin report for rbnt :" + rbnt );
            printReport2(rbnt);
                                
        });

            
    }


    function include(arr, obj) {
        for(var i=0; i<arr.length; i++) {
            if (arr[i] === obj) return true;
        }
        return false;
    }

    var printReport2 = function( rbnt )
    {
        console.log("*** IN printReport2 ***");
        var myarr = JSON.parse(sessionStorage.getItem(rbnt));
        var tcVersionArray = JSON.parse(sessionStorage.getItem(rbnt+"tcSet"));
        //console.log("tcVersionArray : " + tcVersionArray);

        var report2Array = [];
        var tcHeaderArray = [];
        var splash, splash2;
        for(var key in myarr)
        {
            //console.log("*( key : " + key + " )*");
            splash = key.split("^^^");
            var application = splash[3];
            var tags = splash[4];
            var feature = splash[5];
            var scenario = splash[6];
            var errorstep;

            var myTcArray = [];
            myTcArray = myarr[key];

            tcKeysTempArray = Object.keys(myTcArray);
            //console.log("tcKeysTempArray : " + tcKeysTempArray);

            for (var i = 0; i < tcVersionArray.length; i++) 
            {
                //console.log("checking for include(" + tcKeysTempArray + "," + tcVersionArray[i] + ")");
                if(!include(tcKeysTempArray, tcVersionArray[i]))
                {
                    //console.log("element not present. pushing myTcArray[" + tcVersionArray[i] + "] = NA");
                    myTcArray[tcVersionArray[i]] = 'NA:NA';
                }
            }

            if(myTcArray)
            {
                for(var key2 in myTcArray)
                {
                    //console.log("key2 : " + key2);
                    var value = myTcArray[key2];                        
                    //console.log("----( " + key2 + " === " + value + " )----");
                    spash2 = '';
                    splash2 = value.split(":");
                    //console.log(key2 + " : " + splash2[0] + " : " + splash2[1]);
                    errorstep = '';
                    errorstep = splash2[1];
                    myTcArray[key2] = splash2[0];
                }

                var tcValuesArray = [];
                tcValuesArray = Object.values(myTcArray);
                
                tcValuesArray.reverse();
                //console.log("tcValuesArray : " + tcValuesArray);
                //push values for tcresults
                report2Array.push({application: application, tags:tags, feature:feature, scenario:scenario, failedstep: errorstep, tcvalues: tcValuesArray});
                //console.log("pushing : " + application + ":" + tags  + ":" + feature + ":" + scenario + ":" + errorstep + ":" + tcValuesArray);
            }
        }
        tcVersionArray.reverse();
        for(var i=0; i<tcVersionArray.length; ++i)
        {
            var splash = tcVersionArray[i].split('_');
            tcVersionArray[i] = splash[0];
        }
        //console.log("tcHeaderArray : " + tcVersionArray);
        $scope.clients.tcHeaderArray = tcVersionArray;
        $scope.clients.report = report2Array;
    }

      $scope.refreshReport2 = function( release, build, team )
      {
        console.log("*** IN refreshReport2 ***");
        var rbnt = release + ":" + build + ":" + team ;
        //console.log("rbnt : " + rbnt);
        var myArray = JSON.parse(sessionStorage.getItem(rbnt));
        if (!myArray)
        {
            //console.log("Creating Data for 1st time for team : " + team);
            getPageData(release, build, team);
        }
        else
        {
            //console.log("Getting from session object");
            printReport2(rbnt);
        }

      };

      $scope.changeProductVersionsOf = function( product )
      {
        $http.get('/getPreferenceOfProduct/' + product).success( function ( response )
        {
            console.log("getProductVersionsOf successful");
            //console.log("response : " + response[0].preference);
            $scope.clients.awreleases = response[0].preference;
            $scope.selectedRequest.awrelease = $scope.clients.awreleases[0];
        });
      };

      $scope.changeBuildsOfRelease = function( release )
      {
        $http.get('/getBuildsOf/' + release).success( function ( response )
        {
            //console.log("response : " + response);
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
            $scope.clients.awteams.push('All');
            $scope.selectedRequest.awteam = $scope.clients.awteams[0];
        });
      };

  }]);
