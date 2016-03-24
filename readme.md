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
- Clone project
git clone git@bitbucket.org:vdjserver/vdjserver-backbone.git

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
cp app/scripts/config/environment-config.js.defaults app/scripts/config/environment-config.js

vim app/scripts/config/environment-config.js

- Start local instance
grunt server
```

##Running through docker
The vdj-backbone build system can be run via docker as follows:

**Setup environment config:**

```
cp component/app/scripts/config/environment-config.js docker/environment-config/environment-config.js

vim docker/environment-config/environment-config.js
```

**Running a development server that monitors file changes:**

```
docker run -t -p 9001:9001 -v $(pwd)/component:/vdjserver-backbone vdj server --force
```

**Building for deployment:**

```
docker run -t -p 9001:9001 vdj build
```
