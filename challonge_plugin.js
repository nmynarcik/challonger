var challonge_node = require('challonge');
var AuthDetails = require('./auth.json');
var request = require('request');
var serialize = require('node-serialize');

function ChallongePlugin () {
	this.challonge = challonge_node.createClient({
		apiKey: AuthDetails.challonge
	});
}

console.log('::Challonge Init::');

// create a tournament
ChallongePlugin.prototype.create = function(tourneyData, callback){
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

	console.log('::url::',tObj.url);

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

	// request('https://api.challonge.com/v1/tournaments.json?api_key='+AuthDetails.challonge, tObj, function (error, response, body) {
	// 	console.log('Hitting the Challonge api');
	// 	if(error){
	// 		console.log(error);
	// 	}else{
	//     	console.log('Response',body);
	//     	// console.log(response, body); // Show the HTML for the Google homepage.
	//   	}
	// });
	// this.challonge.tournaments.create({
	// 	tournament: {
	// 		name: tourneyData['And, what will be the name of this tournament?'],
	// 		tournament_type: 'single_elimination',
	// 		url: turl + '_' + Date.now(),
	// 		show_rounds: true,
	// 		subdomain: 'match-dallas',
	// 		private: true,
	// 		open_signup: true,
	// 		notify_users_when_matches_open: true,
	// 		notify_users_when_the_tournament_ends: true,
	// 		description: 'Tournament created by: ' + tourneyData.creator
	// 	},
	// 	callback: function(err, data){
	// 		if (err) { console.log('::ERROR::',err); return; }
	// 		console.log('::Tournament Created::',data);
	// 	}
	// });
}

module.exports = ChallongePlugin;