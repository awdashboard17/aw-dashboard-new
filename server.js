var express = require('express');
var app     = express();
var mongojs = require('mongojs');
var database= require('./config/database.js')
var db      = mongojs(database.testDbUrl);
var trendb  = mongojs(database.trendsDbUrl);
var bodyParser = require('body-parser');

ObjectId    = require('mongodb').ObjectID;

app.use(express.static(__dirname + '/Public'));
app.use(bodyParser.json());




// Landing Page graph generation function ,to fetch the latest ones
app.get('/getthemall', function(req, res)
{
	console.log('GET request for getthemall');

	db.collection('AW34').find({},{ _id: 1}).sort({ $natural: -1 }).limit(1 , function(err, docs)
	{
		console.log(JSON.stringify(docs[0]._id));
		var buildid = (docs[0]._id).split("_");
		console.log(buildid);
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


app.get('/filldropdownAW33', function(req, res)
{
	console.log('GET request for filldropdownAW33');
	aw33builds=[];
	db.collection('AW33').find({},{ _id: 1}).sort({ $natural: -1 }, function(err, docs)
	{

		for( index in docs )
		{
			var flag=1;
			var id = (docs[index]._id).split("_");
			if( aw33builds.length == 0 )
			{
				aw33builds.push({ defaultLabel: id[1]});
			}
			else
			{
				for( var i =0; i< aw33builds.length; i++)
				{
					 if( aw33builds[i].defaultLabel === id[1] )
					 {
					 	flag=0;
					 	break;
					 }
				}
				if( flag ==1)
				{
					aw33builds.push({ defaultLabel: id[1]});
				}
			}
		}
		res.send(aw33builds)
		console.log(aw33builds);
	});
});



app.get('/filldropdownAW321', function(req, res)
{
	console.log('GET request for filldropdownAW321');
	aw321builds=[];
	db.collection('AW321').find({},{ _id: 1}).sort({ $natural: -1 }, function(err, docs)
	{

		for( index in docs )
		{
			var flag=1;
			var id = (docs[index]._id).split("_");
			if( aw321builds.length == 0 )
			{
				aw321builds.push({ defaultLabel: id[1]});
			}
			else
			{
				for( var i =0; i< aw321builds.length; i++)
				{
					 if( aw321builds[i].defaultLabel === id[1] )
					 {
					 	flag=0;
					 	break;
					 }
				}
				if( flag ==1)
				{
					aw321builds.push({ defaultLabel: id[1]});
				}
			}
		}
		res.send(aw321builds)
		console.log(aw321builds);
	});
});

app.get('/filldropdownAW34', function(req, res)
{
	console.log('GET request for filldropdownAW34');
	aw34builds=[];
	db.collection('AW34').find({},{ _id: 1}).sort({ $natural: -1 }, function(err, docs)
	{

		for( index in docs )
		{
			var flag=1;
			var id = (docs[index]._id).split("_");
			if( aw34builds.length == 0 )
			{
				aw34builds.push({ defaultLabel: id[1]});
			}
			else
			{
				for( var i =0; i< aw34builds.length; i++)
				{
					 if( aw34builds[i].defaultLabel === id[1] )
					 {
					 	flag=0;
					 	break;
					 }
				}
				if( flag ==1)
				{
					aw34builds.push({ defaultLabel: id[1]});
				}
			}
		}
		res.send(aw34builds)
		console.log(aw34builds);
	});
});

app.get('/filldropdownAW331', function(req, res)
{
	console.log('GET request for filldropdownAW331');
	aw331builds=[];
	db.collection('AW331').find({},{ _id: 1}).sort({ $natural: -1 }, function(err, docs)
	{

		for( index in docs )
		{
			var flag=1;
			var id = (docs[index]._id).split("_");
			if( aw331builds.length == 0 )
			{
				aw331builds.push({ defaultLabel: id[1]});
			}
			else
			{
				for( var i =0; i< aw331builds.length; i++)
				{
					 if( aw331builds[i].defaultLabel === id[1] )
					 {
					 	flag=0;
					 	break;
					 }
				}
				if( flag ==1)
				{
					aw331builds.push({ defaultLabel: id[1]});
				}
			}
		}
		res.send(aw331builds)
		console.log(aw331builds);
	});
});



app.get('/awteam1/:id', function (req, res)
{
    console.log('received a GET request'+req.params.id);
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

//query to fetch only unique failed test cases
/*
db.getCollection("AW33").aggregate
(
          {
	      $unwind : '$results'
	  },
          {
              $match:
	      {
                    '_id': /0124/,
                  'results.result':'failed'
                  //'results.Scenario':'Add objects From Clipboard to CAEAnalysis'
	      }
          },
          {

              $group :
              {
                 "_id" :
                {
                    "Tags"       : "$results.tags",
                    "Feature"    : "$results.Feature",
                    "Scenario"   : "$results.Scenario",
                    "Failed Step": "$results.errorstep"
                }
                ,
                "ABC" :
                {
                    "$addToSet" :
                    {
                        "build_id": "$results.build_id",
                        "comment" : "$results.defid",
                        "defid"   : "$results.comment"
                    }
                }
             }
          }
 )
*/


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------


var dbmap = mongojs(database.mapDbUrl, ['awteam']);


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



app.listen(3000);
console.log("Server running on port 3000");
