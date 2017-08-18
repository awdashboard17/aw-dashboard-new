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
				awrelases.push(awrelease)
			});
			res.send(awrelases);
		});
	});



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
	//--------------- A D M I N U S E R S ------------------------------------------
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
	//--------------- P R O D U C T S ----------------------------------------------
	//------------------------------------------------------------------------------
	//------------------------------------------------------------------------------

	app.get('/getAllProductsVersions/:product', function(req, res)
	{
	/*	
		// Get all versions of product = 'AW'
		db.PRODUCTS.find({'productname': 'AW'},{'versions':1,_id:0})
	*/
		product = req.params.product;
		console.log('GET request for getAllProductsVersions for product : ' + product);
		var productversions = [];

		dbmap.PRODUCTS.find( {productname: product}, { versions: 1, _id: 0 }, function(err, docs)
		{
			res.send(docs);
		});
	});

	app.get('/getPreferenceOfProduct/:product', function(req, res)
	{
		console.log('GET request for getPreferenceOfProduct');
		awrelases=[];
		var product = req.params.product;

		/*
			// Get preference of certain product
			db.PRODUCTS.find({productname : 'AW'},{preference:1, _id:0})
		*/

		dbmap.PRODUCTS.find( { productname : product }, { preference: 1, _id: 0 },function(err, docs)
		{
			res.send(docs);
		});
	});

	app.get('/getAllProducts', function(req, res)
	{
		awproducts=[];
		console.log('GET request for getAllProducts');

		/*
			dbmap.PRODUCTS.find({},{'productname':1,_id:0})
		*/
		dbmap.PRODUCTS.find({},{'productname':1,_id:0},function(err, docs)
		{
			for( index in docs )
			{
				console.log("product[" + index + "] : " + docs[index].productname);
				awproducts.push(docs[index].productname);
			}
			res.send(awproducts);
		});

	});

	app.post('/savePreference/:product', function (req, res)
	{
		console.log('I received a post request for savePreference ****' );

		product = req.params.product;
		console.log("product : " + product);
		
		var mySelected = [];
		mySelected = req.body;
		console.log("mySelected : " + mySelected);

		// clear old preference
		console.log("updating preference to remove all elements");
		dbmap.PRODUCTS.update(
								{productname: product}, 
								{ $set : {preference: [] }} , {multi:true} ,
					function (err, doc)
					{
						//console.log("updated preference to remove all elements");
					}
		)

		/*
			// Add new preference version to certain product
			db.PRODUCTS.update(
								{ productname: '4GD' },{ $push: { preference : "4GD3" } }, {upsert: true}
			)
		*/

		for(iter=0; iter<mySelected.length; iter++)
		{
			console.log("Adding product version : " + mySelected[iter]);
			if(iter === mySelected.length-1)
			{
				dbmap.PRODUCTS.update(
						{ productname: product },
						{ $addToSet: { preference : mySelected[iter] } }, {upsert: true},
					function (err, doc)
					{
						res.json(doc);
					}
				)
			}
			else
			{
				dbmap.PRODUCTS.update(
								{ productname: product },
								{ $addToSet: { preference : mySelected[iter] } }, {upsert: true}
				)
			}
		}

	});

	app.delete('/delProduct/:product', function (req, res)
	{
		console.log('I received a DELETE request for product: ' + req.params.product);
		var productname = req.params.product;

		// Delete entire product using productname.
		//db.PRODUCTS.remove( { "productname" : '4GD' } )

		dbmap.PRODUCTS.remove(
							{ productname : productname }, 
			function (err, doc)
			{
				res.json(doc);
			}
		)
	});

	app.delete('/delProductVersion/:prodandver', function (req, res)
	{
		console.log('I received a DELETE request for product version : ' + req.params.productversion);
		var productversion = req.params.prodandver;

		splash =  productversion.split(":");
		product = splash[0];
		console.log("product : " + product);
		productversion = splash[1];
		console.log("productversion : " + productversion);

		/*
			db.PRODUCTS.update(
								{ productname : '4GD' },
								{ $pull: { 'versions': '4GD3' } }
			);
		*/

		dbmap.PRODUCTS.update(
								{ productname : product }, 
								{ $pull: { versions: productversion } },
			function (err, doc)
			{
				res.json(doc);
			}
		)
	});

	app.post('/addProduct', function (req, res)
	{
		console.log('I received a POST request : addNewProduct');
		productname = req.body.productname;
		console.log(productname);
		console.log("--------------------------");

		/*
			// Add entire product.
			dbmap.PRODUCTS.insert(
								{ productname : "4GD", "versions" : [], "preference" : [] }
			)
		*/

		dbmap.collection('PRODUCTS').insert(
				{ productname : productname, "versions" : [], "preference" : [] }, function (err, doc)
			{
				res.json(doc);
			}
		)

	});

	app.post('/addVersion/:product', function (req, res)
	{
		console.log('I received a POST request : addVersion');
		product = req.params.product;
		productversion = req.body.productversion;
		console.log("productversion : " + req.body.productversion);
	/*
		db.PRODUCTS.update(
							{ productname: '4GD' },{ $push: { versions : '4GD3' } }, {upsert: true}
		)
	*/
		dbmap.PRODUCTS.update(
							{ productname: product },{ $push: { versions : productversion } }, {upsert: true}, function (err, doc)
			{
				//res.json(doc);
			}
		)

		db.createCollection( productversion, 	function(err, doc)	{
				res.json(doc);
			}
		)

	});

	//------------------------------------------------------------------------------
	//------------------------------------------------------------------------------
	//--------------- A W T E A M --------------------------------------------------
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
	//----------------- E N D ------------------------------------------------------
	//------------------------------------------------------------------------------
	//------------------------------------------------------------------------------

	app.listen(4000);
	console.log("Server running on port 4000");
