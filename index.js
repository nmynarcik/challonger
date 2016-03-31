var app = require('express')();
var AuthDetails = require('./auth.json');
var SlackBot = require('slackbots');
 
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
  response.send('Who\'s Ready for some Tourneys?!?!?!?');
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});

var bot = new SlackBot(AuthDetails);

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage 
    var params = {
        // icon_emoji: ':cat:'
    };
    
    // define channel, where bot exist. You can adjust it there https://my.slack.com/services  
    // bot.postMessageToChannel('general', 'meow!', params);
    
    // define existing username instead of 'user_name' 
    // bot.postMessageToUser('nathan', 'I\'ve Restarted!'); 
    
    // define private group instead of 'private_group', where bot exist 
    // bot.postMessageToGroup('lunch', 'meow!', params); 
});

// bot.on('message', function(data) {
//     // all ingoing events https://api.slack.com/rtm 
//     console.log(data);
//     var command = data.text.split(' ')[0];

// });
// console.log('thebot',bot);

bot.on('message', function (msg) {
  //check if message is a command
  if(msg.user != bot.name && (msg.text[0] === '!' || msg.text.indexOf(bot.name.mention()) === 0)){
        console.log('treating ' + msg.text + ' from ' + msg.user + ' as command');
    var cmdTxt = msg.text.split(' ')[0].substring(1);
        var suffix = msg.text.substring(cmdTxt.length+2);//add one for the ! and one for the space
        if(msg.text.indexOf(bot.name.mention()) === 0){
      try {
        cmdTxt = msg.text.split(' ')[1];
        suffix = msg.text.substring(bot.name.mention().length+cmdTxt.length+2);
      } catch(e){ //no command
        bot.sendMessage(msg.channel,'Yes?');
        return;
      }
        }
    alias = aliases[cmdTxt];
    if(alias){
      console.log(cmdTxt + " is an alias, constructed command is " + alias.join(' ') + " " + suffix);
      cmdTxt = alias[0];
      suffix = alias[1] + " " + suffix;
    }
    var cmd = commands[cmdTxt];
        if(cmdTxt === 'help'){
            //help is special since it iterates over the other commands
          bot.sendMessage(msg.user,"Available Commands:", function(){
            for(var cmd in commands) {
              var info = "!" + cmd;
              var usage = commands[cmd].usage;
              if(usage){
                info += " " + usage;
              }
              var description = commands[cmd].description;
              if(description){
                info += "\n\t" + description;
              }
              bot.sendMessage(msg.user,info);
            }
          });
        }
    else if(cmd) {
      try{
        cmd.process(bot,msg,suffix);
      } catch(e){
        if(Config.debug){
          bot.sendMessage(msg.channel, "command " + cmdTxt + " failed :(\n" + e.stack);
        }else{
            commandNotRecognized(msg);
        }
      }
    } else {
      if(Config.respondToInvalid){
        bot.sendMessage(msg.channel, "Invalid command `" + cmdTxt+"`");
      }else{
            commandNotRecognized(msg);
        }
    }
  }
});

var commands = {
	"help": {
		usage: "",
		description: "returns the help menu",
		process: function(bot, msg, suffix) {}
	}
}