module.exports = function(){
  console.log('ENVIRONMENT:', process.env.NODE_ENV);
  switch(process.env.NODE_ENV){
    case 'development':
      return require('./auth.json');
      break;

    case 'production':
      return {
        name: process.env.name,
        token: process.env.token,
        challonge: process.env.challonge,
        subdomain: process.env.subdomain,
        icon: process.env.icon,
        admin: process.env.admin
      };
      break;

    default:
      return 'Shit Broke!';
  }
};
