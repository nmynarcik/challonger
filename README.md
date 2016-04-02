# Challonger

A Slack bot that will run tournaments via [Challonge.com](Challonge.com)


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. ~~See deployment for notes on how to deploy the project on a live system.~~


### Prerequisities

This is a [nodejs](https://nodejs.org/) project. You can either download it from [https://nodejs.org/](https://nodejs.org/) or use one of the following below


#### Mac
If you're using the excellent homebrew package manager, you can install node with one command: `brew install node`.

If not, follow the below steps:
* [Install Xcode](http://developer.apple.com/technologies/tools/)
* [Install git](https://help.github.com/articles/set-up-git/)
* Run commands below

```
git clone git://github.com/ry/node.git
cd node
./configure
make
sudo make install
```

#### Debian (Ubuntu/ Mint)
With Aptitude package manager one can install the package nodeJS then edit there bash to redirect the command node to nodejs.
```
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

#### Redhat (Fedora / CentOs)
```sudo yum install nodejs npm```

#### Windows
Currently, you must use [cygwin](http://www.cygwin.com/) to install node. To do so, follow these steps:
* Install cygwin.
* Open the cygwin command line with Start > Cygwin > Cygwin Bash Shell.
* Run the below commands to download and build node.
```git clone git://github.com/ry/node.git
cd node
./configure
make
sudo make install```


## Installation

Clone the repo. Change directory to the root of the bot files. Download all the dependencies.
```
git clone https://github.com/nmynarcik/challonger.git
cd challonger
npm install
```

Change `auth.json.example` to `auth.json`

Enter the credentials needed in `auth.json`

Run the bot
```
node index.js
```


## Usage

TODO: Write usage instructions


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## History

TODO: Write history


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details


## Acknowledgments

* Inspired by [pinpon.io](http://pinpon.io) and similar slack bots
