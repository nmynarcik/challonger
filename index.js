var app = require('express')();
var AuthDetails = require('./auth.json');
var Botkit = require('botkit');
 
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
  response.send('Who\'s Ready for some Tourneys?!?!?!?');
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});

var controller = Botkit.slackbot();
var bot = controller.spawn(AuthDetails);
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

var commands = {
	"help": {
		usage: "",
		description: "returns the help menu",
		process: function(bot, msg, suffix) {}
	}
}