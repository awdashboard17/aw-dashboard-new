    var myApp = angular.module('myApp', ['ui.router', 'googlechart', 'xeditable', 'ngFileUpload']);
    myApp.controller('directorReportCtrl', ['$scope', '$http', '$location', 'Upload', '$window', function ($scope, $http, $location, Upload, $window) {

        $scope.directorName;


        $scope.GotoBackPage = function () {
            window.history.back();
        }

        $scope.exportData = function () {
            $scope.export_table_to_excel('exportable', 'xlsx');

        };

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
            var wb = XLSX.utils.table_to_book(document.getElementById(id), { sheet: "Sheet JS" });
            var wbout = XLSX.write(wb, { bookType: type, bookSST: true, type: 'binary' });
            var fname = fn || 'Results.' + type;
            try {
                saveAs(new Blob([$scope.s2ab(wbout)], { type: "application/octet-stream" }), fname);
            } catch (e) { if (typeof console != 'undefined') console.log(e, wbout); }
            return wbout;
        }


        $scope.exportExcel = function () {
            var data = document.getElementById('exportable').innerHTML
            $http.post('/downloadExcel').then(function (response) {
                console.log("The call succeeded");

            }, function (error) {
                console.log("An error occurred");
            });
        }

        $scope.uploadExcel = function () {
            //  debugger;
            if ($scope.upload_excel.file.$valid && $scope.file) { //check if from is valid
                $scope.upload($scope.file); //call upload function
            }
            // $scope.upload($scope.file); //call upload function
        }

        $scope.upload = function (file) {
            Upload.upload({
                url: 'http://localhost:3000/uploadExcel', //webAPI exposed to upload the file
                data: { file: file } //pass file as data, should be user ng-model
            }).then(function (resp) { //upload function returns a promise
                if (resp.data.error_code === 0) { //validate success
                    // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                } else {
                    $window.alert('an error occured');
                }
            }, function (resp) { //catch error
                console.log('Error status: ' + resp.status);
                $window.alert('Error status: ' + resp.status);
            }, function (evt) {
                console.log(evt);
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                $scope.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
            });
        }

        $scope.updateUser = function (data, build, tags, scenario) {

            console.log("Comment:" + data);
            console.log("Build: " + build);
            console.log("tag: " + tags);
            console.log("Scenario: " + scenario);
            var all = data + "^^^" + build + "^^^" + tags + "^^^" + scenario;
            //console.log(all);

            $http.put('/UpdateCommentForFailed/' + all).success(function (response) {
                console.log("Success Message: " + response);
            });
        };

        $scope.updatedef = function (data, build, tags, scenario) {
            debugger;
            console.log("Comment:" + data);
            console.log("Build: " + build);
            console.log("tag: " + tags);
            console.log("Scenario: " + scenario);
            var all = data + "^^^" + build + "^^^" + tags + "^^^" + scenario;
            //console.log(all);

            $http.put('/UpdateDefIdForFailed/' + all).success(function (response) {
                console.log("Success Message: " + response);
            });
        };

        $scope.showBuildWiseDirectorReports = function () {

            console.log("Initialising the director's report")

            var buildurl = $location.url();


            var parts = buildurl.split("&");
            var build = (parts[0]).split("_");
            console.log(build[1]);
            var directorpart = parts[1].replace(/%20|_/g, ' ');
            $scope.directorName = directorpart.split("=")[1];
            console.log($scope.directorName);
            release = build[0].replace(/[^\/\d]/g, '');
            release = release.replace('/', '');
            release = release.replace('/', '');
            release = 'AW' + release;
            console.log(release);
            var releaseDbID = release + "_" + build[1];
            console.log(releaseDbID)

            $http.get('/directorWiseBuildResultsForAllTests/' + releaseDbID + '/' + $scope.directorName).success(function (response) {
                console.log("There and back again")
                console.log(response);
                var rows = [];

                response.forEach(function (metric) {
                    rows.push
                        (
                        {
                            c:
                            [
                                { v: metric._id },
                                { v: metric.Passed, f: metric.Passed + ", Total: " + (metric.Passed + metric.Failed) },
                                { v: metric.Failed, f: metric.Failed + ", Total: " + (metric.Passed + metric.Failed) }
                            ]
                        }
                        );
                });

                //console.log(rows);
                $scope.BuildwisechartObject = {};

                $scope.BuildwisechartObject.type = "ColumnChart";

                $scope.BuildwisechartObject.data =
                    {
                        "cols":
                        [
                            { id: "t", label: "Build", type: "string" },
                            { id: "s", label: "Passed", type: "number" },
                            { id: "d", label: "Failed", type: "number" }
                        ],
                        "rows": rows
                    };

                $scope.BuildwisechartObject.options =
                    {
                        hAxis: {
                            textStyle: {
                                fontName: 'Calibri',
                                fontSize: 14, // or the number you want
                                bold: true
                            }

                        },
                        vAxis: {
                            textStyle: {
                                fontName: 'Calibri',
                                fontSize: 14, // or the number you want
                                bold: true
                            }

                        },
                        //'width':800,
                        //'height':300,
                        isStacked: true,
                        legend: 'none',
                        "displayExactValues": true,
                        colors: ['green', 'red'],
                        titleTextStyle: {
                            color: '#262626',    // any HTML string color ('red', '#cc00cc')						
                            fontSize: 20, // 12, 18 whatever you want (don't specify px)
                            bold: true,    // true or false
                            //italic: <boolean>   // true of false
                        },
                        'title': "Director : " + $scope.directorName,
                        tooltip: { textStyle: { fontName: 'Calibri', fontSize: 12, bold: true } }
                    };
            });

            var resultsarray = [];
            $http.get('/directorWiseFailedResults/' + releaseDbID + '/' + $scope.directorName).success(function (response) {
                for (index in response) {
                    console.log(response[index]);
                    var arr = response[index].results;
                    resultsarray = resultsarray.concat(arr);
                }
                console.log(resultsarray);
                $scope.results1 = resultsarray;
            });

        }

    }]);
