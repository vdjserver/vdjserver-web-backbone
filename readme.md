VDJServer-Backbone
===================

The VDJServer-Backbone project is a next generation immune repertoire analysis portal.

##VDJBackbone Deployments

 * Development: <https://vdj-dev.tacc.utexas.edu>
 * Production: <https://vdjserver.org>


##Development Setup
```
- Clone project
git clone git@bitbucket.org:vdjserver/vdjserver-backbone.git

cd <project location>

- Pull npm dependencies
npm install

- Pull bower dependencies
bower install

- Setup local environment config file
cp app/scripts/config/environment-config.js.defaults app/scripts/config/environment-config.js

- Start local instance
grunt server
```

##Development Guidelines

 * Code should follow Google Javascript Style Guide conventions: <https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml>. A jscs.rc file (Javascript Code Style Checker) file has been provided in the project repo for any developers who use it.

 * Spaces are preferred over tabs, and indentation is set at 4 spaces.  
   *  Vimrc settings: set shiftwidth=4, softtabstop=4, expandtab

 * This project uses the Git Flow methodology for code management and development: <https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow>. New development and features should be done on branches that are cloned from the *develop* branch, and then merged into this branch when completed. New release candidates should be branched from *develop*, and then merged into *master* once they have been tested/verified. Once a release branch is ready for production, it should be merged into *master* and tagged appropriately.
