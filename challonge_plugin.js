var challonge_node = require('challonge');
var AuthDetails = require('./auth.json');
var request = require('request');

function ChallongePlugin () {
	this.challonge = challonge_node.createClient({
		apiKey: AuthDetails.challonge
	});
}

console.log('::Challonge Init::');

// create a tournament
ChallongePlugin.prototype.create = function(tourneyData, callback){
	//TODO all this stuff (down to line 32) needs to be done outside of this plugin
	console.log('::tourneyData::',tourneyData);
	var tname = tourneyData['And, what will be the name of this tournament?'];
	var turl = tname.split(' ').join('_');
	turl = turl.substring(0, 40); //trim it to 40 in length so we can fit on the date obj

	var tObj = {
		name: tourneyData['And, what will be the name of this tournament?'],
		tournament_type: 'single_elimination',
		url: turl + '_' + Date.now(),
		show_rounds: true,
		subdomain: 'match-dallas',
		private: true,
		notify_users_when_matches_open: true,
		notify_users_when_the_tournament_ends: true,
		description: 'Tournament created from Slack by: ' + tourneyData.creator
	};

	// console.log('::url::',tObj.url);

	var rUrl = 'https://api.challonge.com/v1/tournaments.json?api_key='+AuthDetails.challonge
				+'&tournament[name]='+tObj.name
				+'&tournament[url]='+tObj.url
				+'&tournament[subdomain]='+tObj.subdomain
				+'&tournament[description]='+tObj.description
				+'&tournament[private]=true'
				+'&tournament[show_rounds]=true'
				+'&tournament[notify_users_when_matches_open]=true'
				+'&tournament[notify_users_when_the_tournament_ends]=true';

	request.post({
		url: rUrl,
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': 0
		}
	}, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }

	  // console.log('::STATUS::',httpResponse.statusCode);
	  // console.log('Success!  Server responded with:', body);
	  callback(JSON.parse(body));
	});
}

ChallongePlugin.prototype.addUser = function(user, tid, callback){
	console.log('::Challonge:: AddUser Called', user);
	var rUrl = 'https://api.challonge.com/v1/tournaments/'+tid+'/participants.json?api_key='+AuthDetails.challonge;

	if(user.indexOf('@') > -1){
		rUrl = rUrl + '&participant[email]='+user;
	}else{
		rUrl = rUrl + '&participant[name]='+user;
	}


	request.post({
		url: rUrl,
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': 0
		}
	}, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('::Adding User Failed::', err);
	  }

	  // console.log('::STATUS::',httpResponse.statusCode);
	  // console.log('Success!  Server responded with:', body);
	  if(callback)
	  	callback(JSON.parse(body));
	});
}
module.exports = ChallongePlugin;
