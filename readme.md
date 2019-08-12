VDJServer Backbone
===================

VDJServer Backbone is a next generation immune repertoire analysis portal.

##Deployments

 * Development: <https://vdj-dev.tacc.utexas.edu>
 * Staging: <https://vdj-staging.tacc.utexas.edu>
 * Production: <https://vdjserver.org>

##Development Guidelines

**Code Style**

 * Code should roughly follow Google Javascript Style Guide conventions: <https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml>.

 * A jscs.rc file (Javascript Code Style Checker) file has been provided in the project repo for any developers who use it.

 * A git pre-commit hook is available via the file pre-commit.sh. To use it, just symlink it as follows: ```ln -s ../../pre-commit.sh .git/hooks/pre-commit```

 * Spaces are preferred over tabs, and indentation is set at 4 spaces.

 *  Vimrc settings: ```set shiftwidth=4, softtabstop=4, expandtab```


**Git Structure**

 * This project uses the Git Flow methodology for code management and development: <https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow>.

 * New development and features should be done on branches that are cloned from the *develop* branch, and then merged into this branch when completed. New release candidates should be branched from *develop*, and then merged into *master* once they have been tested/verified. Once a release branch is ready for production, it should be merged into *master* and tagged appropriately.

##Development Setup

```
- Clone project and init submodules
git clone http://bitbucket.org/vdjserver/vdjserver-web-backbone.git
cd vdjserver-web-backbone
git submodule update --init --recursive

cd [project location]/component

- Install node.js
# Mac OS X (assuming that the homebrew package manager is already installed)
brew install node

# Debian
sudo apt-get install nodejs nodejs-legacy

- Install compass/sass dependencies
# Mac OS X
sudo gem install sass compass

# Debian
sudo apt-get install ruby ruby-dev && sudo gem install sass compass

- Install global npm modules
npm install -g bower grunt grunt-cli

- Pull npm dependencies
npm install

- Pull bower dependencies
bower install

- Setup local environment config file
cd [project location]/docker

cp environment-config/environment-config.js.defaults environment-config/environment-config.js

vim environment-config/environment-config.js

- Start local instance
cd [project location]/component

grunt server
```

##Running through docker

The vdj-backbone project can be run through docker in two ways:

A.) Using a prebuilt image: https://hub.docker.com/r/vdjserver/backbone/

or

B.) Building a local image

You will need to create a local environment-config file with either option. A sample config file is available in this repository at "component/app/scripts/config/environment-config.js.defaults".

```
cp docker/environment-config/environment-config.js.defaults ~/environment-config.js

vim ~/environment-config.js
```

**Using a prebuilt image**

After the config is set up, you can run the image as follows:

```
docker run -t -p 9001:9001 -v ~/environment-config.js:/var/www/html/vdjserver-backbone/app/scripts/config/environment-config.js vdjserver/backbone:release-1 grunt server --force
```

You can also mount your source code directory in the container if you would prefer to make code changes:

```
cp ~/environment-config.js [vdjserver-backbone repo location]/component/app/scripts/config/

docker run -t -p 9001:9001 -v $(pwd)/component:/var/www/html/vdjserver-backbone vdjserver/backbone:release-1 bash -c "bower install && npm install && grunt server --force"
```

**Building a local image for development**

```
cp ~/environment-config.js [vdjserver-backbone repo location]/component/app/scripts/config/

cd [vdjserver-backbone repo location]

docker build -t vdj-dev .

docker run -t -p 9001:9001 -v $(pwd)/component:/var/www/html/vdjserver-backbone vdj-dev bash -c "npm install && npm run dev && grunt server --force"
```
