var challonge_node = require('challonge');
var AuthDetails = require('./auth.json');
var request = require('request');

function ChallongePlugin() {
  this.challonge = challonge_node.createClient({
    apiKey: AuthDetails.challonge,
  });
}

// list tournaments
ChallongePlugin.prototype.list = function(callback) {
  request('https://api.challonge.com/v1/tournaments.json?api_key=' + AuthDetails.challonge + '&subdomain=' + 'match-dallas', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (callback) {
        callback(JSON.parse(body));
      } else {
        return JSON.parse(body);
      }
    }else{
      return error;
    }
  });
};

// create a tournament
ChallongePlugin.prototype.create = function(tourneyData, callback) {
  // console.log('::tourneyData::', tourneyData);

  var rUrl = 'https://api.challonge.com/v1/tournaments.json?api_key=' + AuthDetails.challonge
        + '&tournament[name]=' + tourneyData.name
        + '&tournament[url]=' + tourneyData.url
        + '&tournament[subdomain]=' + tourneyData.subdomain
        + '&tournament[description]=' + tourneyData.description
        + '&tournament[private]=true'
        + '&tournament[game_id]='+ tourneyData.game_id
        + '&tournament[notify_users_when_matches_open]=true'
        + '&tournament[notify_users_when_matches_open]=true'
        + '&tournament[notify_users_when_the_tournament_ends]=true';

  request.post({
    url: rUrl,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 0,
    },
  }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return err;
    }

    // console.log('::STATUS::',httpResponse.statusCode);
    // console.log('Success!  Server responded with:', body);
    callback(JSON.parse(body));
  });
};

// add a user
ChallongePlugin.prototype.addUser = function(user, tid, callback) {
  console.log('::Challonge-AddUser:: ', user);
  var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '/participants.json?api_key=' + AuthDetails.challonge;

  if (user.indexOf('@') > -1) {
    rUrl = rUrl + '&participant[email]=' + user;
  } else {
    rUrl = rUrl + '&participant[name]=' + user;
  }

  request.post({
    url: rUrl,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 0,
    },
  }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return err;
    }

    // console.log('::STATUS::',httpResponse.statusCode);
    // console.log('Success!  Server responded with:', body);
    if (callback)
      callback(JSON.parse(body));
  });
};

module.exports = ChallongePlugin;
