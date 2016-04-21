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
  console.log('::Challonge-list:: ');
  request('https://api.challonge.com/v1/tournaments.json?api_key=' + AuthDetails.challonge + '&subdomain=' + 'match-dallas', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (callback) {
        callback(JSON.parse(body));
      } else {
        return JSON.parse(body);
      }
    } else {
      return error;
    }
  });
};

// create a tournament
ChallongePlugin.prototype.create = function(tourneyData, callback) {
  console.log('::Challonge-Create::');

  var rUrl = 'https://api.challonge.com/v1/tournaments.json?api_key=' + AuthDetails.challonge
        + '&tournament[name]=' + tourneyData.name
        + '&tournament[url]=' + tourneyData.url
        + '&tournament[subdomain]=' + tourneyData.subdomain
        + '&tournament[description]=' + tourneyData.description
        + '&tournament[private]=true'
        + '&tournament[game_id]=' + tourneyData.game_id
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

// start a tournament
ChallongePlugin.prototype.start = function(tid, callback) {
  console.log('::Challonge-Start::');
  var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '/start.json?api_key=' + AuthDetails.challonge;
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

// delete a tournament
ChallongePlugin.prototype.destroy = function(tid, callback) {
  console.log('::Challonge-Destroy::');
  var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '.json?api_key=' + AuthDetails.challonge;
  request({
      url: rUrl,
      method: 'DELETE',
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
        callback(body);
    });
};

// reset a tournament
ChallongePlugin.prototype.reset = function(tid, callback) {
  console.log('::Challonge-Reset::');
  var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '/reset.json?api_key=' + AuthDetails.challonge;
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
        callback(body);
    });
};

// finalize tournament
ChallongePlugin.prototype.finalize = function(tid, callback) {
  console.log('::Challonge-Finalize::');
  var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '/finalize.json?api_key=' + AuthDetails.challonge;
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

// get matches
ChallongePlugin.prototype.matches = function (tid, callback) {
  console.log('::Challonge-Matches::', tid);
  var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '/matches.json?api_key=' + AuthDetails.challonge;
  request({
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

ChallongePlugin.prototype.bracket = function (tid, callback) {
  console.log('::Challonge-GetBracket::', tid);
  var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '.json?api_key=' + AuthDetails.challonge;
  request({
    url: rUrl,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 0,
    },
  }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return err;
    }

    if (callback) {
      callback(JSON.parse(body));
    }else{
    	console.log(JSON.parse(body));
    	return JSON.parse(body);
    }
  });
};

ChallongePlugin.prototype.participant = function(tid, uid, callback) {
	console.log('::Challonge-GetPartipant::', uid, tid);
	var rUrl = 'https://api.challonge.com/v1/tournaments/' + tid + '/participants/' + uid + '.json?api_key=' + AuthDetails.challonge;
	request({
		url: rUrl
	}, function optionalCallback(err, httpResponse, body) {
		if(err)
			return err;

		if(callback)
			callback(JSON.parse(body));
	});
};

module.exports = ChallongePlugin;
