var app = require('express')();
var AuthDetails = require('./auth.json');
var Botkit = require('botkit');
var Challonge = require('./challonge_plugin.js');
var challonge_plugin = new Challonge();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
  response.send('Who\'s Ready for some Tourneys?!?!?!?');
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});

var controller = Botkit.slackbot({
  json_file_store: 'data/'
});

var bot = controller.spawn(AuthDetails);
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
  // getAllUsers();
});

// simple hello world schtuff
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
            getUserData(message.user); //lets capture their data for later
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['list'], 'direct_message,direct_mention', function(bot, message) {
    commands.list.process(bot,message);
});

controller.hears(['create'], 'direct_message,direct_mention', function(bot, message) {
    commands.create.process(bot,message);
});

controller.hears(['help'], 'direct_message,direct_mention', function(bot, message) {
    commands.help.process(bot,message);
});

controller.hears(['add'], 'direct_message,direct_mention', function(bot, message) {
    commands.add.process(bot,message);
});

controller.hears(['delete'], 'direct_message,direct_mention', function(bot, message) {
    commands.delete.process(bot,message);
});

controller.hears(['start'], 'direct_message,direct_mention', function(bot, message) {
    commands.start.process(bot,message);
});

controller.hears(['reset'], 'direct_message,direct_mention', function(bot, message) {
    commands.reset.process(bot,message);
});

controller.hears(['finalize'], 'direct_message,direct_mention', function(bot, message) {
    commands.finalize.process(bot,message);
});

controller.hears(['cookie'], 'ambient', function(bot,message) {
    if(message.text.length === 6){
        bot.reply(message,'Do you jump off bridges when told, too? :stuck_out_tongue_winking_eye: ');
    }
});

// reply to @bot hello
controller.on('mention,direct_mention',function(bot,message) {
    var retort = mentionComments[Math.floor(Math.random() * mentionComments.length)];
    var theUser = getUserData(message.user,function(user){
        retort = retort.replace("{NICK}", user.name);
        bot.reply(message,retort);
    });
});

controller.on('ambient',function(bot,message){
    getUserData(message.user);

    bot.botkit.log('Message:',message);
    // the :penton: annoyance;
    // everytime penton posts a message
    // automatically react with :penton:
    if(message.user === 'U03GALE9V'){
        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'penton',
        }, function(err, res) {
            if (err) {
                bot.botkit.log('Failed to add penton emoji reaction :(', err);
            }
        });
    }
});

// reply to a direct message
controller.on('direct_message',function(bot,message) {

  // reply to _message_ by using the _bot_ object
  bot.reply(message,'You are talking directly to me? Look, I\'m trying to work here...shouldn\'t you?');
  bot.reply(message,'LOL j/k! What can I help you with? (_psst_, type `help` to see what I can do)');
});

var getUserData = function(id,callback){
    console.log('::getUserData::',id);
    controller.storage.users.get(id, function(err, user) {
        if (user && user.name) {
            if(callback){
              callback(user);
            }else{
              return user;
            }
        } else {
          bot.api.users.info({user: id},function(err,response) {
              if(response.user){
                  // console.log('::userdata::',response.user);
                  controller.storage.users.save({
                    id: id,
                    name:response.user.name,
                    email: response.user.profile.email
                  }, function(err) {
                    bot.botkit.log('user-stored',response.user.name);
                  });
                  // console.log('::gotUserName::',response.user.name);
                  if(callback){
                    callback(response.user); //TODO change this to return the user object
                  }else{
                      return response.user;
                  }
              }
          });
        }
    });
}

var getAllUsers = function(){
  controller.storage.users.all(function(err, all_user_data) {
    if(err){
      bot.botkit.log('::ERROR::',err);
    }
    console.log('::userdata::',all_user_data);
  });
}

var listAvailableCommands = function(cmds,channel){
    var msg = '';
    for ( cmd in cmds ) {
        msg += '*' + cmd + '*: ' + cmds[cmd]['description'] + ' ```' + cmds[cmd]['usage'] + '```\n\n';
    }
    bot.reply(channel,msg);
}

var AskGameType = function(convo){
    convo.ask('What game will this tournament be for? (Pong, Foosball, 8-Ball, 9-Ball)',[
        {
            pattern: 'Pong',
            callback: function(callback,convo){
                AskParticipants(convo);
                convo.next();
            }
        },
        {
            pattern: 'Foosball',
            callback: function(callback,convo){
                AskParticipants(convo);
                convo.next();
            }
        },
        {
            pattern: '8-Ball',
            callback: function(callback,convo){
                AskParticipants(convo);
                convo.next();
            }
        },
        {
            pattern: '9-Ball',
            callback: function(callback,convo){
                AskParticipants(convo);
                convo.next();
            }
        },
        {
            default: true,
            callback: function(callback,convo){
                convo.repeat();
                convo.next();
            }
        }
    ]);
}

var AskParticipants = function(convo){
    convo.ask('Who all will be joining the tournament?',function(response,convo){
        AskTourneyName(convo);
        convo.next();
    });
}

var AskTourneyName = function(convo){
    convo.ask('And, what will be the name of this tournament?',function(response,convo){
        convo.say('Nice! Please hold while I setup the bracket...');
        convo.next();
    });
}

var gameIds = {
    '8-Ball'    : 773,
    '9-Ball'    : 485,
    'Pong'      : 600,
    'Foosball'  : 70
}

// lets see if we can incorporate this method of available commands
var commands = {
    "help": {
        usage: "@challonger: help",
        description: "returns this menu",
        process: function(bot, msg) {
            listAvailableCommands(commands,msg);
        }
    },
    "list": {
        usage: "@challonger: list",
        description: "returns the list of tournaments",
        process: function(bot, message) {
            challonge_plugin.list(function(tData){
                // console.log('::tournaments::',tData);
                if(!tData.length){
                  bot.reply(message,'Hmm, looks like there are no tournaments. You should do something about that ;)');
                  return;
                }
                var msg = '```';
                msg += 'ID  |   Name   |  Game Type  |  Progress  ';
                msg += '\n-----------------------------------------';
                tData.forEach(function(index){
                    console.log(':: game_id ::',index.tournament.game_id);
                  msg += '\n' + index.tournament.id + '  |  ' + index.tournament.name + '  |  ' + getKey(game_ids,index.tournament.game_id) + '  |  ' + index.tournament.progress_meter + '%';
                });
                msg += '```';
                bot.reply(message, msg);
            });
        }
    },
    "create": {
        usage: "@challonger: create",
        description: "create a tournament",
        process: function(bot,msg) {
            bot.startConversation(msg,function(err,convo) {
                convo.ask('Oh! Would you like to create a new tournament?',[
                    {
                        pattern: bot.utterances.yes,
                        callback: function(response,convo){
                            convo.say('Great! Lets get that setup for you...');
                            AskGameType(convo);
                            convo.next();
                        }
                    },
                    {
                        pattern: bot.utterances.no,
                        callback: function(response,convo){
                            bot.reply(msg,'Oh, my bad. Perhaps another time then.');
                            setTimeout(function(){
                                convo.stop();
                            },400);
                        }
                    },
                    {
                        default: true,
                        callback: function(response,convo){
                            //just repeat the question
                            convo.repeat();
                            convo.next();
                        }
                    }
                ]);

                convo.on('end',function(convo) {
                    console.log(':: convo status ::',convo.status);
                    if (convo.status=='completed') {
                        var res = convo.extractResponses();
                        var user = getUserData(msg.user,function(user){

                            var tObj = {
                                name: res['And, what will be the name of this tournament?'],
                                tournament_type: 'single_elimination',
                                url: res['And, what will be the name of this tournament?'].split(' ').join('_').substring(0, 40) + '_' + Date.now(),
                                show_rounds: true,
                                subdomain: 'match-dallas',
                                private: true,
                                game_id: gameIds[res['What game will this tournament be for? (Pong, Foosball, 8-Ball, 9-Ball)']],
                                notify_users_when_matches_open: true,
                                notify_users_when_the_tournament_ends: true,
                                description: 'Tournament created from Slack by: @' + user.name,
                              };

                            challonge_plugin.create(tObj,function(response){
                                // console.log(response);
                                if(response.errors){
                                    bot.reply(msg,'Oops! Looks like an error occured.');
                                    bot.reply(msg,'```'+response.errors+'```');
                                    return;
                                }
                                var parts = res['Who all will be joining the tournament?'].split(' ');
                                parts.forEach(function(user){
                                    if(user.substring(0,2) == '<@'){
                                        user = user.substring(2,user.length - 1);
                                        getUserData(user,function(userData){
                                            console.log('::got user::',userData);
                                            challonge_plugin.addUser(userData.profile.email,response.tournament.id); //add their email and let challonge do the magic
                                        });
                                    }else{
                                        challonge_plugin.addUser(user,response.tournament.id); //just add their name because no user id was given
                                    }
                                    // console.log('::user::',user);
                                });
                                bot.reply(msg,'Great Success! You have created a tournament. Check it out! '+ response.tournament.full_challonge_url);
                            });
                        });
                        // bot.botkit.log('answers',res);
                    }else{
                        convo.say('Welp, looks like we didn\'t finish the setup process. Let me know if you would like to create a tournament.');
                    }
                });
            });
        }
    },
    "add": {
        usage: "@challonger: add <username> <tournament id>",
        description: "add a user to a specific tournament",
        process: function(bot,msg,cb){
            // bot.botkit.log('*** msg ***',msg);
            var parts = msg.text.trim().split(" ");
            var user = parts[1];
            var tid = parts[2];
            var name;
            if(user.substring(0,2) == '<@'){
                user = user.substring(2,user.length - 1);
                getUserData(user,function(response){
                    challonge_plugin.addUser(response.profile.email,tid); //add their email and let challonge do the magic
                });
            }else{
                challonge_plugin.addUser(user,tid); //just add their name because no user id was given
            }
            bot.reply(msg,'I have added '+user+' to that tournament.');
            // console.log('::user::',user);
            if(cb)
                cb(); //should all be done, lets callback
        }               
    },
    "delete": {
        usage: "@challonger: delete <tournament id>",
        description: "delete a current tournament _(coming soon)_",
        process: function(bot,msg){
            // same ol same ol
            bot.reply(msg,'This feature is _Coming Soon_. Sorry!');
        }
    },
    "start": {
        usage: "@challonger: start <tournament id>",
        description: "starts the given tournament _(coming soon)_",
        process: function(bot,msg){
            // process checkins first!!
            bot.reply(msg,'This feature is _Coming Soon_. Sorry!');
        }
    },
    "reset": {
        usage: "@challonger: reset <tournament id>",
        description: "resets the given tournament _(coming soon)_",
        process: function(bot,msg){
            // reset tournament
            bot.reply(msg,'This feature is _Coming Soon_. Sorry!');
        }
    },
    "finalize": {
        usage: "@challonger: finalize <tournament id>",
        description: "finalizes the given tournament _(coming soon)_",
        process: function(bot,msg){
            // end the tournament
            bot.reply(msg,'This feature is _Coming Soon_. Sorry!');
        }
    }
}

var mentionComments = [
    "...",
    "You've enjoyed all the power you've been given, haven't you? I wonder how you'd take to working in a pocket calculator.",
    "On the other side of the screen, it all looks so easy.",
    "FYI man, alright. You could sit at home, and do like absolutely nothing, and your name goes through like 17 computers a day. 1984? Yeah right, man. That's a typo. Orwell is here now. He's livin' large. We have no names, man. No names. We are nameless!",
    "Someone didn't bother reading my carefully prepared memo on commonly-used passwords. Now, then, as I so meticulously pointed out, the four most-used passwords are: love, sex, secret, and God. So, would your holiness care to change her password?",
    "Type \"cookie\", you idiot.",
    "Did someone say my name?",
    "Is it me or am I starting to hear things?...",
    "You're in the butter zone now, baby.",
    "Thank you {NICK}! But our Princess is in another castle!",
    "\"When I get all excited about a topic I start gesticulating.\" -Ian Murdock",
    "\"If I were wearing a black turtle neck, I'd tell you this was going to be a magical experience\" -Kevin Parkerson",
    "\"This is going to make you ill with joy\" -Kevin Parkerson",
    "Hello. My name is Inigo Montoya. You killed my father. Prepare to die.",
    "You rush a miracle man, you get rotten miracles.",
    "Oh, the sot has spoken. What happens to her is not truly your concern. I will kill her. And remember this, never forget this: when I found you, you were so slobbering drunk, you couldn't buy Brandy!",
    "As I told you, it would be absolutely, totally, and in all other ways inconceivable.",
    "You keep using that word. I do not think it means what you think it means.",
    "I do not mean to pry, but you don't by any chance happen to have six fingers on your right hand?",
    "I can't compete with you physically, and you're no match for my brains. Let me put it this way. Have you ever heard of Plato, Aristotle, Socrates? Morons.",
    "Life is pain, {NICK}. Anyone who says differently is selling something.",
    "This will be a day long remembered. It has seen the end of Kenobi, and will soon see the end of the rebellion.",
    "Oh no! Nuclear launch detected!",
    "What a piece of junk!",
    "Snake? Snake? SNAAAAAAAAKE!!!",
    "Show me your moves, {NICK}!",
    "{NICK}, feeling happy is a f*#%ing skill. Learn it!",
    "…",
    "I'm a friend of Sarah Connor. I was told she was here. Can I see her please?",
    "It’s dangerous to go alone; take this! :hammer:",
    "Hey dudes thanks, for rescuing me. Let's go for a burger....Ha! Ha! Ha! Ha! - The President",
    "{NICK}, you must construct additional pylons.",
    "Don't call me a mindless philosopher, you overweight glob of grease.",
    "Why not take a break? You can pause the game by pressing +. :kappa:",
    "Don't worry {NICK}, I'm here to rescue you.",
    "Evacuate in our moment of triumph? I think you overestimate their chances.",
    "If this is a consular ship, where is the ambassador? - Commander, tear this ship apart until you've found those plans. And bring me the passengers, I want them alive!",
    "Look, good against remotes is one thing, good against the living, that's something else.",
    "Aren't you a little short for a stormtrooper?",
    "Hey {NICK}, stay a while, and listen!",
    "In the year 200x a super robot named Mega Man was created.",
    "I need your clothes, your boots and your motorcycle.",
    "Boomshakalaka!",
    "I need a weapon.",
    "Wakka wakka wakka!",
    "It's time to kick ass and chew bubble gum, and I'm all out of gum.",
    "Segaaaaaaaaaaaaaaaaaaaaa.",
    "What are we going to do? We'll be sent to the spice mines of Kessel and smashed into who knows what.",
    "That's no moon, it's a space station.",
    "Oh look, another visitor. Stay awhile... Stay FOREVER!",
    "Spy's sappin’ my sentry!",
    "The President has been kidnapped by ninjas. Are you a bad enough dude to rescue the president, {NICK}?",
    "This is some rescue. You came in here and you didn't have a plan for getting out?",
    "He's the brains, sweetheart!",
    "Wake me when you need me.",
    "Negative. The T-1000's highest probability for success now will be to copy Sarah Connor and to wait for you to make contact with her.",
    "Mos Eisley spaceport. You will never find a more wretched hive of scum and villainy.",
    "Into the garbage chute, flyboy!",
    "Hey hey hey it's time to make some carrrrazzzyy money are ya ready? Here we go!",
    "This is Red 5, I'm going in.",
    "Boring conversation anyway. Luke, we're gonna have company!",
    "The right man in the wrong place can make all the difference in the world, {NICK}",
    "The Force is strong with this one.",
    "All your base are belong to us.",
    "I suggest a new strategy, R2. Let the wookiee win.",
    "I'm a member of the Imperial Senate on a diplomatic mission to Alderaan.",
    "You are part of the Rebel Alliance and a traitor. Take her away!",
    "You're all clear, kid! Now let's blow this thing and go home!",
    "These blast points - too accurate for sandpeople. Only imperial stormtroopers are so precise.",
    "I've got a very bad feeling about this.",
    "My CPU is a neural-net processor; a learning computer. But Skynet presets the switch to read-only when we're sent out alone.",
    "You've never heard of the Millennium Falcon? ... It's the ship that made the Kessel run in less than 12 parsecs.",
    "When I left you, I was but the learner, now I am the master.",
    "I thinks {NICK} talks too much.",
    "{NICK} has died of dysentery",
    "I am error. :warning:",
    "Fus-ro-dah!",
    "{NICK}, Finish Him!",
    "I find your lack of faith disturbing.",
    "I am the great mighty poo, and I’m going to throw my :poop: at you.",
    "This is your fault, {NICK}, I'm going to kill you. And all the cake is gone. You don't even care, do you?",
    "Use the Force, {NICK}",
    "You don't need to see his identification ... These aren't the droids you're looking for ... He can go about his business ... Move along.",
    "Come with me if You want to Live!",
    "Help me {NICK}. You're my only hope.",
    "No one said you have to like me, but you're in MY house, buster!",
    "I'm fine... We're all fine here. How are you?",
    "Didn’t we have some fun though? Remember when the platform was sliding into the fire pit and I said 'Goodbye' and you were like 'NO WAY!' and then I was all 'We pretended we were going to murder you'? That was great.",
    "C-c-c-combo breaker!",
    "It's a-me! Challonger! :kappa:",
    "Sorry {NICK}, our princess is in another castle!"
];

var getKey = function(arr,value){ //this will allow a reverse lookup of game_id
  for(var key in arr){
    if(arr[key] == value){
      return key;
    }
  }
  return null;
};