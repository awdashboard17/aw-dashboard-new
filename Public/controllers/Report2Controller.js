var myApp = angular.module('myApp', ['xeditable', 'ngFileUpload']);
/*
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
*/
    myApp.controller('Report2Ctrl', ['$scope', '$http', '$window', function ($scope, $http, $window)
    {
      $scope.columnSort = { sortColumn: 'col1', reverse: false }; 

      $scope.clients = [];
      $scope.clients.awproducts = [];
      $scope.clients.tcHeaderArray2 = [];

      $scope.BringBackBaseLines = function()
      {
        console.log("In the show report 2");

        // Get all products. e.g. AW, TC
        $http.get('/getAllProducts').success(function (response)
        {
            console.log(" Received from database : getAllProducts : ");
            //console.log("response : " + response);

            $scope.clients.awproducts = response;
            $scope.selectedRequest = {};
            //console.log("$scope.clients.awproducts[0] : " + $scope.clients.awproducts[0]);
            $scope.selectedRequest.awproduct = $scope.clients.awproducts[0];

            // Get all releases from products. e.g. AW34, AW32 etc
            $http.get('/getPreferenceOfProduct/' + $scope.selectedRequest.awproduct).success( function ( response )
            {
                console.log("BringBackReleases successful");
                //console.log("response : " + response[0].preference);

                $scope.clients.awreleases = [];
                $scope.clients.awreleases = response[0].preference;
                $scope.selectedRequest.awrelease = $scope.clients.awreleases[0];
                //console.log($scope.selectedRequest.awrelease);

                // Get all builds for release selected. e.g. 0828, 0822 etc
                $http.get('/getBuildsOf/' + $scope.selectedRequest.awrelease).success( function ( response )
                {
                    //console.log("response : " + response);
                    $scope.clients.awbuilds = [];
                    $scope.clients.awbuilds = response;
                    $scope.selectedRequest.awbuild = $scope.clients.awbuilds[0];

                    var rnb = $scope.selectedRequest.awrelease+":"+$scope.selectedRequest.awbuild;
                    //console.log("rnb : " + rnb);

                    // Get all teams for the build date selected. e.g. 0828, 0822 etc
                    $http.get('/getTeamsOfBuild/' + rnb).success( function ( response )
                    {
                        //console.log("TEAMS : " + response.values);
                        var teams = [];
                        teams = response.values;
                        $scope.clients.awteams = [];
                        $scope.clients.awteams =  teams;
                        $scope.selectedRequest.awteam = $scope.clients.awteams[0];

                        var rbnt = $scope.selectedRequest.awrelease + ":" + $scope.selectedRequest.awbuild + ":" + $scope.selectedRequest.awteam ;
                        if (!JSON.parse(sessionStorage.getItem(rbnt+"Report2")))
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

      /* This function is to populate the data for a particular release, build and team in Report2 format
         
         The data(each row printed in the report) is stored in associative arrays as follows:
         myArray[release+"^^^"+build+"^^^"+team+"^^^"+resultDetails.Application+"^^^"+resultDetails.tags+"^^^"+resultDetails.Feature+"^^^"+resultDetails.Scenario] = TcArray;

         And each TcArray is again an associative array as below:
         TcArray[tcversion] = "result:errorstep";
         e.g. 
         TcArray[Tc1140] = failed:And I press "Reset" button on notification message
         TcArray[Tc1130] = passed:NA
         TcArray[Tc11231] = NA:NA
      */

      var getPageData = function( release, build, team )
      {
        console.log("*** IN getPageData ***");
        var rbnt = release + ":" + build + ":" + team ;
        //console.log("rbnt : " + rbnt);

        // This set is use to collect all the tc versions for selected rel, build and team. e.g. Tc1123, Tc1140 etc.
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
                
                // If team is same as the team selected by user.
                if(team === resultDetails.Team)
                {
                    console.log("=========================================================================");
                    console.log("build id : " + resultDetails.build_id);
                    console.log("tc version : " + myTcversion);
                    console.log("result : " + resultDetails.result);
                    //console.log("+++++++++++++++ team : " + team);
                    //console.log("+++++++++++++++ resultDetails.Team : " + resultDetails.Team);

                    // If errorstep database value is empty then push 'NA'
                    if(resultDetails.errorstep === '')
                        errorstep = 'NA';
                    else
                        errorstep = resultDetails.errorstep;

                    // Form key object to store each row in report2
                    teamwiseKeyObj = '';
                    teamwiseKeyObj = release+"^^^"+build+"^^^"+team+"^^^"+resultDetails.Application+"^^^"+resultDetails.tags+"^^^"+resultDetails.Feature+"^^^"+resultDetails.Scenario;
                    //console.log("--------------------------------------------------");
                    //console.log("teamwiseKeyObj : " + teamwiseKeyObj);
                    
                    // Add tc version in set. This is to get all unique tcversions for this release-build.
                    tcverSet.add(myTcversion);
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

            // Store report2 object for release + build + team in session object.
            $window.sessionStorage.setItem(rbnt+"Report2",JSON.stringify(myArray));
            var tcVersionArray = Array.from(tcverSet);
            tcVersionArray.sort();
            console.log("after sorting tcVersionArray : " + tcVersionArray);

            // Store tcset object for release + build + team in session object.
            //console.log("setting tcversionarray in session : " + tcVersionArray);
            $window.sessionStorage.setItem(rbnt+"tcSet"+"Report2",JSON.stringify(tcVersionArray));
            //console.log("printin report for rbnt :" + rbnt );
            printReport2(rbnt);
                                
        });
            
    }

    // function to find object in an array.
    function findObjInArray(arr, obj) {
        for(var i=0; i<arr.length; i++) {
            if (arr[i] === obj) return true;
        }
        return false;
    }

    // function to print the report2
    var printReport2 = function( rbnt )
    {
        console.log("*** IN printReport2 ***");
        //Get the stored report2 item from sessionstorage
        var myarr = JSON.parse(sessionStorage.getItem(rbnt+"Report2"));
        var tcVersionArray = JSON.parse(sessionStorage.getItem(rbnt+"tcSet"+"Report2"));

        //console.log("tcVersionArray : " + tcVersionArray);

        //report2Array for storing row values. tcHeaderArray to store header values of report
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

            for (var i = 0; i < tcVersionArray.length; i++) 
            {
                var tcKeysTempArray = Object.keys(myTcArray);
                //console.log("tcKeysTempArray : " + tcKeysTempArray);
                //console.log("checking for findObjInArray(" + tcKeysTempArray + ", OBJECT - " + tcVersionArray[i] + ")");

                // Check whether tcversion is present in AllTcVersionArray for rbnt. i.e. array created from tcset keys.
                if(!findObjInArray(tcKeysTempArray, tcVersionArray[i]))
                {
                    //if element not present then add the tcversion(key) in TcArray with value NA:NA
                    //e.g. TcArray[tc1140] = NA:NA
                    console.log("element not present. pushing myTcArray[" + tcVersionArray[i] + "] = NA:NA");
                    myTcArray[tcVersionArray[i]] = 'NA:NA';
                }
            }

            if(myTcArray)
            {
/*               
                for(var key2 in myTcArray)
                {
                    //console.log("key2 : " + key2);
                    var value = myTcArray[key2];                        
                    //console.log("----( " + key2 + " === " + value + " )----");
                    spash2 = '';
                    splash2 = value.split(":");
                    console.log(key2 + " : " + splash2[0] + " : " + splash2[1]);
                    errorstep = '';
                    errorstep = splash2[1];
                    myTcArray[key2] = splash2[0];
                }
*/
                var tcValuesArray = [];
                var sorted_keys = Object.keys(myTcArray).sort();
                var push = false;

                // This loop is to find if each row printed in report has atleast one result as failed, then only push/print that line in report.
                for(i=0; i<sorted_keys.length; ++i)
                {
                    //console.log(">>>>>>>>>>> : " + sorted_keys[i] + " : " + myTcArray[sorted_keys[i]]);
                    var value = myTcArray[sorted_keys[i]];
                    //console.log("myTcArray[" + sorted_keys[i] + "] = " + value);
                    
                    var temp = value.split(":");
                    if(temp[0] === 'passed')
                        value = temp[0];
                    tcValuesArray.push(value);
                    if(temp[0] === 'failed')
                    {
                        //console.log("changing push to true... ");
                        push = true;
                    }
                }

                //console.log(">>>>>>>>>>>> : before reverse tcValuesArray : " + tcValuesArray);
                tcValuesArray.reverse();
                //console.log(">>>>>>>>>>>> : after reverse tcValuesArray : " + tcValuesArray);

                //push values for tcresults only if it has failed values.
                if(push)
                {
                    report2Array.push({application: application, tags:tags, feature:feature, scenario:scenario, tcvalues: tcValuesArray});
                    //console.log("pushing : " + application + ":" + tags  + ":" + feature + ":" + scenario + ":" + tcValuesArray);
                }
            }
        }
        tcVersionArray.reverse();
        $scope.clients.tcHeaderArray2 = Array.from(tcVersionArray);
        //console.log("MYtcVersionArray : " + $scope.clients.tcHeaderArray2);
        for(var i=0; i<tcVersionArray.length; ++i)
        {
            var splash = tcVersionArray[i].split('_');
            tcVersionArray[i] = splash[0];
        }
        //console.log("+++++++++++++ : after reverse tcHeaderArray : " + tcVersionArray);
        $scope.clients.tcHeaderArray = tcVersionArray;
        $scope.clients.report = report2Array;
    }

      // This function is called when you change the team on the report page.
      $scope.refreshReport2 = function( release, build, team )
      {
        console.log("*** IN refreshReport2 ***");
        var rbnt = release + ":" + build + ":" + team ;
        //console.log("rbnt : " + rbnt);
        var myArray = JSON.parse(sessionStorage.getItem(rbnt+"Report2"));
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

        // This function is called to update the defect Id into the database.
        $scope.updateDefectId = function( data, scenario, tcvalues )
        {
            console.log("Data : "+ data);
            console.log("Scenario: "+ scenario);
            //var all = data+"^^^"+build+"^^^"+team+"^^^"+scenario;
            //console.log(all);
            console.log($scope.selectedRequest.awrelease);
            console.log($scope.selectedRequest.awbuild);
            console.log($scope.selectedRequest.awteam);
            for(var i=0; i<tcvalues.length; ++i)
            {
                console.log("tcversion : " +tcvalues[i]);
            }

            build = $scope.selectedRequest.awrelease + "_" + $scope.selectedRequest.awbuild + "_" + tcvalues[0];
            var all = data+"^^^"+build+"^^^"+$scope.selectedRequest.awteam+"^^^"+scenario;
            //var all = data+"^^^"+ 'AW34_0306_Tc1015_1013b'+"^^^"+'SDPD - Analysis Request'+"^^^"+'validate AR Filter';
            console.log(all);

            $http.put('/UpdateDefIdForFailed/'+ all ).success(function (response)
            {
                console.log("Success Message: "+ response);
            });
           
        };

      $scope.changeProductVersionsOf = function( product )
      {
        $http.get('/getPreferenceOfProduct/' + product).success( function ( response )
        {
            console.log("getPreferenceOfProduct successful");
            //console.log("response : " + response[0].preference);
            $scope.clients.awreleases = response[0].preference;
            $scope.selectedRequest.awrelease = $scope.clients.awreleases[0];
        });
      };

      $scope.changeBuildsOfRelease = function( release )
      {
        $http.get('/getBuildsOf/' + release).success( function ( response )
        {
            console.log("getBuildsOf successful");
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
            $scope.selectedRequest.awteam = $scope.clients.awteams[0];
        });
      };

  }]);
