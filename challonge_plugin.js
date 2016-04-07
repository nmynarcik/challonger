var challonge_node = require('challonge');
var AuthDetails = require('./auth.json');

function ChallongePlugin () {
	this.challonge = challonge_node.createClient({
		apiKey: AuthDetails.challonge
	});
}

console.log('::Challonge Init::');

// create a tournament
ChallongePlugin.prototype.create = function(tourneyData){
	var tname = tourneyData['And, what will be the name of this tournament?'];
	console.log(tname);
	var url = tname.replace(' ','_');
	console.log('t',this.challonge.tournaments);
	this.challonge.tournaments.create({
		tournament: {
			name: tname,
			url: url,
			tournamentType: 'single elimination',
		},
		callback: function(err, data){
			console.log(arguments);
			if (err) { console.log('::ERROR::',err); return; }
			console.log('::Tournament Created::',data);
		}
	});
}

module.exports = ChallongePlugin;