var express = require('express');
var app     = express();
var mongojs = require('mongojs');
var database= require('./config/database.js')
var db      = mongojs(database.testDbUrl);
var trendb  = mongojs(database.trendsDbUrl);
var bodyParser = require('body-parser');
var multer= require('multer');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

var xlsx = require('xlsx');
var groupArray = require('group-array');
var data_length;

ObjectId    = require('mongodb').ObjectID;

app.use(express.static(__dirname + '/Public'));
app.use(bodyParser.json());

app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '_' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

var upload = multer({ //multer settings
                    storage: storage,
					fileFilter : function(req, file, callback) { //file filter
                        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    }
                }).single('file');


var findAndModify = function(collectionId,buildId, defectsArray){
        
		
		return new Promise(function(resolve, reject){

       defectsArray.forEach(function(element) {
           console.log("Element up for update")
           db.collection(collectionId).update(
               { 
			"results": 
		 	{ 
		 		$elemMatch: 
		     	{ 
		            "build_id": buildId,
		            
		            "result"  : "failed",
		            "Scenario": element.scenario,
                    "Feature": element.feature,
					"Application":element.application
		        } 
		   	} 
		},
	    {
	        $set: {
                'results.$.defid' : element["defect id"],
                'results.$.comment':element.comment
         }
	    },
	    function(err, docs)
	    {
	    	if (err) reject(Error(err));
			else
			resolve(docs);
	    }
           )
       }, this);
		});

    }

/** API path that will upload the files */
app.post('/uploadExcel/:collectionId', function(req, res) {
		var collectionId = req.params.collectionId;
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
			
			if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
			
			try {

				exceltojson({
					
                    input: req.file.path,
                     output: null,     //  './uploads/result.json'
                    lowerCaseHeaders:true
                }, function(err,result){
					 var hit_count = 0;
					
					 var data = groupArray(result,'build');
					 data_length = Object.keys(data).length;
					
					 for(var build_id in data){
						  console.log("The data_length is : ",data_length)
                        findAndModify(collectionId,build_id, data[build_id].filter(result => (result.comment != 'empty' || result['defect id'] != 'empty')))
						.then(function(result){					

							
							hit_count=hit_count+1;
							

							if(hit_count == data_length){
								res.json({error_code:0,err_desc:null, data:[]});
								res.send();
							}
							
						}, function(error){
							console.log(error);
							res.json({error_code:-1,err_desc:"Error while updating database."});
							res.send();
							
				 				
						});
                    }
					
					
                
                });

				
            } catch (e){
				console.log(e);
                 res.json({error_code:1,err_desc:"Corrupted excel file"});
				 res.send();
            }
             
        });
    });	

app.get('/getthemall/:release', function(req, res)
{
	release = req.params.release;
	console.log('GET request for getthemall for ' + req.params.release);

	db.collection(release).find({},{ _id: 1}).sort({ $natural: -1 }).limit(1 , function(err, docs)
	{
		console.log(JSON.stringify(docs[0]._id));
		var buildid = (docs[0]._id).split("_");
		console.log("buildid : " + buildid);
		db.collection(release).find({_id: new RegExp(buildid[0] + "_" + buildid[1])},{_id:1,'Details.Teamwise':1}).sort({ $natural: -1 },function(err,docs1)
		{
			res.send(docs1);
		});
	});

});

// Landing Page graph generation function ,to fetch the latest ones
app.get('/getthemall', function(req, res)
{
	console.log('GET request for getthemall');

	db.collection('AW34').find({},{ _id: 1}).sort({ $natural: -1 }).limit(1 , function(err, docs)
	{
		console.log(JSON.stringify(docs[0]._id));
		var buildid = (docs[0]._id).split("_");
		console.log("buildid : " + buildid);
		db.collection('AW34').find({_id: new RegExp(buildid[0] + "_" + buildid[1])},{_id:1,'Details.Teamwise':1}).sort({ $natural: -1 },function(err,docs1)
		{
			res.send(docs1);
		});
	});

});


app.put('/UpdateDefIdForFailed/:id',function(req, res)
{
	var splash = (req.params.id).split("^^^");
	var release = (splash[1]).split("_");
	console.log("Release:"+ release[0]);console.log("Comment:"+ splash[0]);console.log("Build: "+ splash[1] );console.log("Team: "+ splash[2] );console.log("Scenario: "+ splash[3]);
	var comment = splash[0];
    var build = splash[1];
    var team = splash[2];
    var scenario = splash[3];
	db.collection( release[0] ).update
	(
		{
			"results":
		 	{
		 		$elemMatch:
		     	{
		            "build_id": build,
		            "Team"    : team,
		            "result"  : "failed",
		            "Scenario": scenario
		        }
		   	}
		},
	    {
	        $set: {'results.$.defid' : comment }
	    },
	    function(err, docs)
	    {
	    	console.log(JSON.stringify(docs));
	    	res.send(docs);
	    }
	)
});

app.put('/UpdateCommentForFailed/:id',function(req, res)
{
	var splash = (req.params.id).split("^^^");
	var release = (splash[1]).split("_");
	console.log("Release:"+ release[0]);console.log("Comment:"+ splash[0]);console.log("Build: "+ splash[1] );console.log("Team: "+ splash[2] );console.log("Scenario: "+ splash[3]);
	var comment = splash[0];
    var build = splash[1];
    var team = splash[2];
    var scenario = splash[3];
	db.collection( release[0] ).update
	(
		{
			"results":
		    {
		    	$elemMatch:
		        {
		            "build_id": build,
		            "Team"    : team,
		            "result"  : "failed",
		            "Scenario": scenario
		        }
		    }
		 },
	    {
	        $set: {'results.$.comment': comment }
	    },
	    function(err, docs)
	    {
	    	console.log(JSON.stringify(docs));
	    	res.send(docs);
	    }
	)
});

app.get('/getPrefReleases', function(req, res)
{
	console.log('GET request for getPrefReleases');
	awrelases=[];

	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { preference: 1, _id: 0 },function(err, docs)
	{
		for( index in docs )
		{
			var prefReleasesInfo = docs[index].preference.AW;
			var prefRelease = prefReleasesInfo.split("_");
			for(i=0; i<prefRelease.length; ++i)
			{
				console.log( "splash : " + prefRelease[i] );
				awrelases.push(prefRelease[i]);
			}
		}
		res.send(awrelases);
	});
});

app.get('/getPrefReleasesOfProduct/:prod', function(req, res)
{
	console.log('GET request for getPrefReleasesOfProduct');
	awrelases=[];
	var prod = req.params.prod;

	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { preference: 1, _id: 0 },function(err, docs)
	{
		for( index in docs )
		{
			//console.log("var prefReleasesInfo = docs["+(index)+"].preference." + prod);
			eval("var prefReleasesInfo = docs["+(index)+"].preference." + prod);
			console.log("prefReleasesInfo : " + prefReleasesInfo);

			var prefRelease = prefReleasesInfo.split("_");
			for(i=0; i<prefRelease.length; ++i)
			{
				console.log( "splash : " + prefRelease[i] );
				awrelases.push(prefRelease[i]);
			}
		}
		res.send(awrelases);
	});
});

app.get('/getPrefReleasesOfProduct2/:pni', function(req, res)
{
	console.log('GET request for getPrefReleasesOfProduct');
	awrelases=[];
	var pni = req.params.pni;
	splash = pni.split(":");
	var prod = splash[0];
	var product_index = splash[1];

	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { preference: 1, _id: 0 },function(err, docs)
	{
		for( index in docs )
		{
			//console.log("var prefReleasesInfo = docs["+(index)+"].preference." + prod);
			//eval("var prefReleasesInfo = docs["+(index)+"].preference." + prod);
			console.log("index : " + index);
			var myline = docs[index].preference[product_index];
			console.log(myline);
			splash = myline.split(":");
			myprod = splash[0];
			console.log("myprod : " + myprod);
			var prefReleasesInfo = splash[1];
			console.log("prefReleasesInfo : " + prefReleasesInfo);
			if(myprod === prod)
			{
				prefRelease = prefReleasesInfo.split("_");
				for(i=0; i<prefRelease.length; ++i)
				{
					console.log( "splash : " + prefRelease[i] );
					awrelases.push(prefRelease[i]);
				}
			}
		}
		res.send(awrelases);
	});
});


app.get('/getAllProducts', function(req, res)
{
	awproducts=[];
	console.log('GET request for getAllProducts');
	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { productnames: 1, _id: 0 },function(err, docs)
	{
		for( index in docs )
		{
			eval("var prefProductsInfo = docs["+(index)+"].productnames");
			console.log("prefProductsInfo.length : "+prefProductsInfo.length);
			for(i=0; i<prefProductsInfo.length; ++i)
			{
				console.log( "prefProduct : " + prefProductsInfo[i] );
				awproducts.push(prefProductsInfo[i]);
			}
		}
		res.send(awproducts);
	});
});

/*
app.get('/getAllVersionsForProduct/:product', function (req, res)
{
    console.log('received a GET request for getAllVersionsForProduct : ' + req.params.release);
    var prod = req.params.product;
    console.log("prod : " + prod);
	awbaselines=[];
	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { products: 1, _id: 0 },function(err, docs)
	{

		


	});

});
*/

app.get('/getBuildsOf/:release', function (req, res)
{
    console.log('received a GET request for getBuildsOf release : ' + req.params.release);
    var release = req.params.release;
    //console.log(release);
	awbaselines=[];
	db.collection(release).find({},{ _id: 1, Details: 1}).sort({ $natural: -1 }, function(err, docs)
	{
		var id;
		var bld;
		for( index in docs )
		{
			var flag=1;
			var id = (docs[index]._id).split("_");
			var bld = id[1];
			
			if( awbaselines.length == 0 )
			{
				awbaselines.push(bld);
			}
			else
			{
				for( var i = 0; i < awbaselines.length; ++i)
				{
					 if( awbaselines[i] === bld )
					 {
					 	flag=0;
					 	break;
					 }
				}
				if( flag == 1)
				{
					awbaselines.push(bld);
				}
			}

		}
		res.send(awbaselines)
		console.log(awbaselines);
	});

});

app.get('/getAllReleases', function(req, res)
{
	console.log('GET request for getAllReleases');
	awrelases=[];
	db.getCollectionNames(function(err, colNames) 
	{
		if (err) return console.log(err);
		colNames.forEach(function(awrelease) 
		{
			//console.log("collection : " + awrelease);
			awrelases.push(awrelease)
		});
		res.send(awrelases);
	});
});


app.get('/getAllProductsVersions/:prod', function(req, res)
{
/*	
	var pni = req.params.pni;
	splash = pni.split(":");
	prod = splash[0];
	prod_indx = splash[1];
*/
	prod = req.params.prod;
	console.log('GET request for getAllProductsVersions for product : ' + prod);
	eval("var field = \"\'products." + prod + ".versions\'\"");
	console.log("field value : " + field);

	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { products: 1, field: 1, _id: 0 },function(err, docs)
	{
		console.log(docs);
    	res.send(docs);
	});
});



		//eval("var productVersionInfo = docs["+prod_indx+"]." + prod + ".versions");
		//console.log("productVersionInfo length "+productVersionInfo.length);

		//for( index in docs )
		//{
			/*
			eval("var productVersionInfo = docs."+ prod_indx +"." + prod + ".versions");
			console.log("productVersionInfo : " + productVersionInfo);
			for (i=0; i<productVersionInfo.length; ++i)
			{
				console.log("productVersion : " + productVersionInfo[i]);
				prodversions.push(productVersionInfo[i]);
			}
*/
			//console.log("Version[" + index + "] " + docs[index]);

			//prodversions.push(docs[index]);
		//}

			/*
			//var version = productVersionInfo.split("_");
			for(iter=0; iter<version.length; ++iter)
			{
				console.log("version : " + version[iter]);
				prodversions.push(version[iter]);
			}
			*/
/*
		for( index in docs )
		{
			eval("var prefProductsInfo = docs["+(index)+"].productnames");
			console.log("prefProductsInfo.length : "+prefProductsInfo.length);
			for(i=0; i<prefProductsInfo.length; ++i)
			{
				console.log( "prefProduct : " + prefProductsInfo[i] );
				awproducts.push(prefProductsInfo[i]);
			}
		}
*/



/*
app.get('/getConcatinatedProductsVersions/:prod', function(req, res)
{
	var prod = req.params.prod;
	console.log('GET request for getConcatinatedProductsVersions for product : ' + prod);
	prodversions = [];
	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { prod_versions: 1, _id: 0 },function(err, docs)
	{
		for( index in docs )
		{
			eval("var productVersionInfo = docs["+(index)+"].prod_versions." + prod);
			console.log("productVersionInfo : " + productVersionInfo);
		}
		res.send(productVersionInfo);
	});
});
*/

/* VIKRANT NEED UPDATE HERE
app.get('/getAllProductsAndVersions', function(req, res)
{
	var prod = req.params.prod;
	console.log('GET request for getAllProductsAndVersions for product : ' + prod);
	prodversions = [];
	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { prod_versions: 1, _id: 0 },function(err, docs)
	{
		for( index in docs )
		{
			eval("var productVersionInfo = docs["+(index)+"].prod_versions." + prod);
			console.log("productVersionInfo : " + productVersionInfo);
		}
		res.send(productVersionInfo);
	});
});
*/

app.get('/awteam1/:id', function (req, res)
{
    console.log('received a GET request awteam1 for id : ' + req.params.id);
    var buildinfo = req.params.id;
    var splash = buildinfo.split("_");
    console.log("AWTEAM1: "+splash[0]);
    db.collection( splash[0] ).find({ _id: buildinfo },{}, function (err, docs)
    {
        var passfail= docs[0].Details[0].config[0].totalpass +","+docs[0].Details[0].config[0].totalfail;
        console.log(passfail);
        res.send(passfail);
    });
});

app.get('/awteam2/:id', function (req, res)
{
    //console.log('received a GET request for awteam2');
    var buildinfo = req.params.id;
    //console.log(buildinfo);
    var splash = buildinfo.split("_");
    db.collection( splash[0] ).find({ _id: buildinfo },{'Details.Teamwise':1}, function (err, docs)
    {
    	var each = docs[0].Details[0].Teamwise;
    	res.send(each);
    });
});

app.get('/TeamResultsForAllBuilds/:id', function(req,res)
{
	console.log("Received get request for TeamResultsForAllBuilds : " + req.params.id);
	var build = req.params.id;
	console.log("The build number is: "+ build);
	var splash = build.split("_");
	var release = splash[0];
	var build1 = splash[1];
	console.log("The build number is: "+ build1);
	var regex = new RegExp(build1);
	debugger;
	db.collection( release ).find({_id: new RegExp(build)},{'Details':1}).sort({_id:-1}, function(err , docs)
	{
		console.log('docs - ' + docs);
		console.log(docs.length);
		res.send(docs);
	});
});

app.get('/GetFailedForTeamOnAllBuilds/:id', function(req, res)
{
	var all = (req.params.id).split("_");
	console.log('id ' + req.params.id)
	var release = all[0];
	var build = all[1];
	var team = all[2];
	console.log(" "+ release +" "+ build +" "+team+" ");
	db.collection( release ).aggregate
	(
	 	{
	 		$unwind : '$results'
	 	},
	    {
	    	$unwind : '$results.Team'
	    },
	    {
	    	$match:
	        {
	        	'results.build_id': new RegExp(release+"_"+build),
	            'results.Team'  :  team,
	            'results.result': 'failed'
	         }
	    },
	    function(err, docs)
	    {
			//console.log(docs);
			res.send( docs );
	    }
	);
});

app.get('/directorWiseBuildResultsForAllTests/:id/:directorName', function(req,res)
{
	console.log("Received get request for directorWiseResultsForAllTests");
	var build = req.params.id;
	var directorName = req.params.directorName;
	console.log("Director's name is :"+ directorName)
	var splash = build.split("_");
	var release = splash[0];
	var build1 = splash[1];
	console.log("The build number is: "+ build1);
	var idRegex= new RegExp(build);

	db.collection(splash[0]).aggregate(
		{
      		$unwind:'$Details'
  		},
  		{
      		$unwind:'$Details.Teamwise'
  		},
  		{
      		$match:{_id:idRegex,'Details.Teamwise.director':directorName}
  		},
		  {
      $group:{
          	_id:'$_id',
          	Passed: {$sum:'$Details.Teamwise.pass'},
          	Failed : { $sum: '$Details.Teamwise.fail'}
          }
  },function( err, docs)
	  		{
	  			console.log("Here is the director data");
	  			for(index in docs)
	  			{
	  				console.log("INDEX: "+index);
	  				console.log(" :: "+ JSON.stringify(docs[index]));
	  			}
	  			res.send(docs);
	  		}
	)

});
app.get('/directorWiseFailedResults/:id/:directorName', function(req, res)
{
	var all = (req.params.id).split("_");
	//console.log()
	var build = req.params.id;
	var directorName = req.params.directorName;
	console.log("Director's name is :"+ directorName)
	var splash = build.split("_");
	var release = splash[0];
	db.collection( release ).aggregate
	(
	 	{
	 		$unwind : '$results'
	 	},
	    {
	    	$unwind : '$results.Director'
	    },
	    {
	    	$match:
	        {
	        	'results.build_id': new RegExp(build),
	            'results.Director'  :  directorName,
	            'results.result': 'failed'
	         }
	    },
	    function(err, docs)
	    {
			console.log(docs);
			res.send( docs );
	    }
	);
});


app.get('/getdirectorwiseresultsforbuild/:id', function( req, res)
{
	console.log("GET request for getdirectorwiseresultsforbuild");
	var buildinfo = req.params.id;
    console.log(buildinfo);
    var splash = buildinfo.split("_");


	db.collection(splash[0]).aggregate
	(
	  {
	      $unwind : '$Details'
	  },
	  {
	      $unwind : '$Details.Teamwise'
	  },
	  {
	      $match:
	      {
	            _id  : buildinfo
	      }
	  },
	  {
	      $group:
	      {
	            _id: '$Details.Teamwise.director',
	            Passed : { $sum: '$Details.Teamwise.pass' },
	            Failed : { $sum: '$Details.Teamwise.fail'}
	      }
	  },
	  function( err, docs)
	  {
	  		console.log("Here is the director data");
	  		for(index in docs)
	  		{
	  			console.log("INDEX: "+index);
	  			console.log(" :: "+ JSON.stringify(docs[index]));
	  		}
	  		res.send(docs);
	  }
	);
});

app.get('/gettrendsdata/:id',function(req,res)
{
	console.log("In the gettrendsdata");
	var trendrelease =(req.params.id)+"_TRENDS_DATA";
	console.log("TREND COLLECTION: "+ trendrelease);
	trendb.collection(trendrelease).aggregate
	(
	    {
	        $unwind : '$Details'
		},
	    {
	        $group:
	        {
	            "_id": "$Details.date",
	            "LineChart":
	            {
	                "$addToSet":
	               {
	                    "id": "$Details.id",
	                    "platform": "$Details.platform" ,
	                    "passper":"$Details.passper",
	                    "date":"$Details.date"
	               }
	            }
	        }
	    },
	    function(err,docs)
	    {
	    	for(index in docs)
	    	{
	    		console.log("INDEX:"+ index);
	    		//console.log(docs[index]);
	    	}
	    	res.send(docs);
	    }
	);

});

app.get('/updateTeamsData/',function(req,res)
{
	console.log("In the updateTeamsData : serverjs");
	console.log("Updating teams DATA : ");
   	res.send("returning updated Teams data");
});

app.get('/getreportsdata/:id',function(req,res)
{
	console.log("In the getreportsdata : serverjs");
	var reportrelease =(req.params.id)+"_REPORTS_DATA";
	console.log("VIKRANT REPORT DATA : "+ reportrelease);
   	res.send(reportrelease);
});


app.get('/getcucandplm/:id',function(req,res)
{
	console.log("GET request for getcucandplm");
	var build = req.params.id;
	var splash = build.split("_");
	console.log(splash[0]);
	var release = splash[0];
	db.collection( release ).find({ _id: build },{'Details.config':1,'Details.Teamwise':1}, function (err, docs)
    {
 		console.log(docs);
    	res.send(docs);
    });
});


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------


var dbmap = mongojs(database.mapDbUrl, ['awteam']);

// Requests for adminUsers
app.get('/adminUsers', function (req, res)
{
    console.log('I received a GET request : adminUsers');
    dbmap.ADMINUSERS.find(function (err, docs) {
        console.log(docs);
        res.json(docs);
    });
});

app.post('/adminUsers', function (req, res)
{
    console.log('I received a POST request : adminUsers');
    console.log(req.body);
    dbmap.collection( 'ADMINUSERS' ).insert({firstname:req.body.firstname, lastname:req.body.lastname, username:req.body.username, email:req.body.email, password:req.body.password},
    function (err, doc) {
        res.json(doc);
    });
});

/*
app.get('/checkIfUserExists:username', function (req, res)
{
    console.log('I received a GET request : checkIfUserExists');
    console.log("username : " + req.params.username);
	//var userExists = false;
	//dbmap.collection( 'ADMINUSERS' ).people.count( { username: { $username: req.body.username } } );
	//var docs = dbmap.collection( 'ADMINUSERS' ).find({username:  req.params.username},
	var docs = dbmap.collection( 'ADMINUSERS' ).find({username:  req.params.username});
	//console.log("docs length : " + docs);
	//console.log(docs);
	if(docs)
	{
		console.log("returning true : " + docs);
		res.send('true');
	}		
	else
	{
		console.log("returning false : " + docs);
		res.send('false');
	}
	//res.send('true');
		
});
*/

app.post('/setPreferences2/:pni', function (req, res)
{
    console.log('I received a post request for setPreferences ' );

	var pni = req.params.pni;
	var splash = pni.split(":");

	var product = splash[0];
	product_index = parseInt(splash[1]);

	console.log("product : " + product);
	//product_index = product_index + 1;
	console.log("product_index : " + product_index);

	var mySelected = [];
	mySelected = req.body.sel;
	console.log(mySelected);
	//var uname = req.data.adminUser;
	
	console.log( 'data to UPDATE : ' + req.body );
	var relData;
	for(i=0; i<req.body.length-1; ++i)
		relData = (relData + (req.body[i] + "_"));
	relData = (relData + (req.body[i]));
	console.log("reldata : " + relData);

	var mypref = product + ":" + relData;

	//eval("var myrec=\'" + product + "\' : \'" + relData + "\'");

	console.log("mypref : " + mypref);
/*
	dbmap.collection('ADMINUSERS').update(
        { username: 'admin' },
			{ 	$push: { 
				preference: {
				 mypref,
				$position: product_index
			},
			function (err, doc)
			{
				res.json(doc);
			}
		}
	})
*/
	
	dbmap.ADMINUSERS.findAndModify
	(
		{
			query:  { username: 'admin' },
			update: { $addToSet: { preference: mypref }}, 
		},
		function (err, doc)
		{
			res.json(doc);
		}
	)


});


app.post('/setPreferences/:prod', function (req, res)
{
    console.log('I received a post request for adminUsersForPref ' );

	prod = req.params.prod;
	
	var mySelected = [];
	mySelected = req.body;
	console.log(mySelected);
	//var uname = req.data.adminUser;
	
	console.log( 'data to UPDATE : ' + req.body );
	var relData = '';

	for(i=0; i<mySelected.length-1; ++i)
	{
		if(mySelected[i] === '')
		{
			continue;
		}
		else
		{
			relData = (relData + (mySelected[i]));
			relData = (relData + "_");
		}
	}

	if(mySelected[mySelected.length] === '')
	{
		relData = relData.substr(0,relData.length-1);
	}
	else
	{
		relData = (relData + (mySelected[i]));
		//relData = (relData + "_");
	}


/*
	if (req.body[0] != '')
	{
		relData = req.body[0] + "_";
		for(i=1; i<req.body.length-1; ++i)
			relData = (relData + (req.body[i] + "_"));
		relData = (relData + (req.body[i]));
	}
	else 
		relData = '';	

*/
	
	//relData = (relData + "\'");
	console.log("relData : " + relData);

	
	eval("var fieldToUpdate=\"preference." + prod + "\"");
	console.log("fieldToUpdate : " + fieldToUpdate);

	var obj={};
	obj[fieldToUpdate] = relData;
	dbmap.collection('ADMINUSERS').update(
                        { username: 'admin' },{ $set: obj }, 
		function (err, doc)
		{
			res.json(doc);
		}
	)



/*
	var newFieldName = prod, o;
	db.collection('ADMINUSERS').update(
	{  username: 'admin' },
	{$set:(o = {}, o["preference."+newFieldName] = relData, o)}, 
			function (err, doc)
			{
				console.log("err : " + err);
				console.log(doc);
				res.json(doc);
			}
	)
*/
/*
	dbmap.collection('ADMINUSERS').update(
                        { username: 'admin' },{ $set: {  } }, 
		function (err, doc)
		{
			console.log("err : " + err);
			console.log(doc);
			res.json(doc);
		}
	)
*/
/*
	dbmap.ADMINUSERS.findAndModify
	(
		{
			query:  { username: 'admin' },
			update: { $set: { fieldToUpdate }}, 
		},
		function (err, doc)
		{
			console.log(doc);
			res.json(doc);
		}
	)
*/
});


app.delete('/adminUsers/:username', function (req, res)
{
    console.log('I received a DELETE request with username: ' + req.params.username);
    var uname = req.params.username;
    console.log(uname);
    dbmap.ADMINUSERS.remove({ "username": uname }, function (err, doc) {
        res.json(doc);
    });
});

app.get('/adminUsers/:username', function (req, res)
{
    console.log('I received a GET request with username : ' + req.params.username);
    var uname = req.params.username;
    console.log('uname ' + uname);
    dbmap.ADMINUSERS.findOne({ "username": uname }, function (err, doc)
    {
        res.json(doc);
    });
});

app.put('/adminUsers/:username', function (req, res)
{
  console.log('I received a PUT request with username : '+ req.params.username);
  var uname = req.params.username;
  console.log( 'username to UPDATE : ' + uname );
  dbmap.ADMINUSERS.findAndModify
  (
      {
        query:  { username: uname },
        update: { $set: { firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, email: req.body.email, password: req.body.password }}
      },
      function (err, doc)
      {
        res.json(doc);
      }
  );
});


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

// Requests for adminUsers
/*
app.get('/getAllProducts', function (req, res)
{
    console.log('I received a GET request : adminUsers');
	awproducts = [];

	dbmap.collection('ADMINUSERS').find( { username: "admin"}, { products: 1, _id: 0 },function(err, docs)
	{
		for( index in docs )
		{
			var productsInfo = docs[index].products;
			for(i=0; i<productsInfo.length; ++i)
			{
				console.log( "awproduct : " + productsInfo[i] );
				awproducts.push(productsInfo[i]);
			}
		}
		res.send(awproducts);
	});
})
*/

app.post('/addProduct', function (req, res)
{
    console.log('I received a POST request : addNewProduct');
	prod = req.body.productname;
    console.log(req.body.productname);
	console.log("--------------------------");

	eval("var fieldToUpdate = {\""+ prod +"\" : {\"versions\" : [] }}");
	console.log("fieldToUpdate : " + fieldToUpdate);
	dbmap.collection('ADMINUSERS').update(
                        { username: 'admin' },{ $push: { products : fieldToUpdate } }, {upsert: true}
	)
	dbmap.collection('ADMINUSERS').update(
                        { username: 'admin' },{ $push: { productnames : prod },  }, {upsert: true}
	)

	var relData = '';
	console.log("relData : " + relData);
	
	eval("var fieldToUpdate=\"preference." + prod + "\"");
	console.log("fieldToUpdate : " + fieldToUpdate);
	
	var obj={};
	obj[fieldToUpdate] = relData;
	dbmap.collection('ADMINUSERS').update(
                        { username: 'admin' },{ $set: obj }, 
		function (err, doc)
		{
			res.json(doc);
		}
	)

/*
	var mypref = prod + ":";
	dbmap.collection('ADMINUSERS').findAndModify
	(
		{
			query:  { username: 'admin' },
			update: { $addToSet: { preference: mypref }}, 
		},
		function (err, doc)
		{
			res.json(doc);
		}
	)
*/
});

app.post('/addVersion/:prodandindx', function (req, res)
{
    console.log('I received a POST request : addVersion');
	pni = req.params.prodandindx;
	splash =  pni.split(":");
	prod = splash[0];
    console.log("xxxproduct : " + prod);
	prodindx = splash[1];
    console.log("xxxprodindx : " + prodindx);
	ver = req.body.productversion;
	console.log("xxxversion : " + req.body.productversion);

	eval("var fieldToUpdate = {\'products."+ prodindx + "." + prod + "." + "versions\' : \"" + ver + "\"}");
	console.log("fieldToUpdate : " + fieldToUpdate);

	dbmap.collection('ADMINUSERS').update(
                        { username: 'admin' },{ $addToSet: fieldToUpdate }, function (err, doc)
		{
			res.json(doc);
		}
	)

});

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------


// Requests for awteam
app.get('/awteam', function (req, res)
{
    console.log('I received a GET request');

    dbmap.awteam.find(function (err, docs) {
        console.log(docs);
        res.json(docs);
    });
});

app.post('/awteam', function (req, res)
{
    console.log('I received a POST request');
    console.log(req.body);
    dbmap.awteam.insert({ Tag: req.body.Tag, Team: req.body.Team, Director: req.body.Director, ScrumMaster: req.body.ScrumMaster, Owner: req.body.Owner },
    function (err, doc) {
        res.json(doc);
    });
});

app.delete('/awteam/:id', function (req, res)
{
    console.log('I received a DELETE request');
    var tag = req.params.id;
    console.log(tag);
    dbmap.awteam.remove({ "Tag": tag }, function (err, doc) {
        res.json(doc);
    });
});

app.get('/awteam/:id', function (req, res)
{
    console.log('I received a GET request with ID');
    var tag = req.params.id;
    console.log('tag' + tag);
    dbmap.awteam.findOne({ "Tag": tag }, function (err, doc)
    {
        res.json(doc);
    });
});

app.put('/awteam/:id', function (req, res)
{
  console.log('I received a PUT request with ID');
  var teamasid = req.params.id;
  console.log( 'teamasid - ' + teamasid );
  console.log( req.body.Tag );
  dbmap.awteam.findAndModify
  (
      {
        query:  { Team: teamasid },
        update: { $set: { Tag: req.body.Tag, Team: req.body.Team, Director: req.body.Director, ScrumMaster: req.body.ScrumMaster, Owner: req.body.Owner }}
      },
      function (err, doc)
      {
        res.json(doc);
      }
  );
});


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

app.listen(4000);
console.log("Server running on port 4000");
