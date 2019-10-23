VDJServer Backbone
===================

VDJServer Backbone is a next generation immune repertoire analysis portal.

## Deployments

 * Development: <https://vdj-dev.tacc.utexas.edu>
 * Staging: <https://vdj-staging.tacc.utexas.edu>
 * Production: <https://vdjserver.org>

## Development Setup

The development setup is configured to mount the local directory with the source code files
inside the docker container so that they can be modified and be available without regenerating the docker image.
In order to support this, an `npm install` will install of the node modules into that local directory. The first
time the docker image is run, the install will take a few minutes.

```
- Clone project and init submodules
git clone http://bitbucket.org/vdjserver/vdjserver-web-backbone.git
cd vdjserver-web-backbone
git submodule update --init --recursive

- Setup local environment config file
cp docker/environment-config/environment-config.js.defaults component/app/scripts/config/environment-config.js
vim component/app/scripts/config/environment-config.js

- Build the docker image
docker build -t vdjserver/backbone:develop .

- For Mac/Linux, run docker image (with name vdjserver-backbone) with source code directory mounted
docker run -t -p 9001:9001 --rm --name vdjserver-backbone -v $(pwd)/component:/var/www/html/vdjserver-backbone vdjserver/backbone:develop bash -c "npm install && npm run dev && npm start"

- For Windows, run docker image (with name vdjserver-backbone) with source code directory mounted
docker run -t -p 9001:9001 --rm --name vdjserver-backbone -v ${PWD}/component:/var/www/html/vdjserver-backbone vdj-marionette bash -c "npm install && npm run dev && npm start"
```

*Note for Windows users: If you run the Mac/Linux command with a Mac-created container, (ie. `vdjserver/backbone:develop`), then `npm` will get stuck while trying to install `fsevents` (which is native to MacOS FSEvents; [read more](https://www.npmjs.com/package/fsevents)). Workaround: use a Windows-created container or the following with the Mac/Linux code:* `npm install --no-optional`

Doing a CTRL-C will not completely stop the docker container. As the next time you perform `docker run`, you will get an error that
the container name is already in use. You need to perform `docker stop` to completely stop the container.

```
- Stop the docker container
docker stop vdjserver-backbone
```

Even though `webpack-dev-server` is watching the file system, and it says that it has recompiled when a file is changed,
it doesn't seem to working correctly, nor is it able to force the browser to refresh. To force a recompile of the
website, do this command from another terminal window. Then do a refresh of the browser to load the new code.

```
- Perform a recompile of the website within the running container
docker exec vdjserver-backbone npm run dev
```

## Testing Setup

## Production Setup

In the production environment, `docker-compose` is used at the higher-level (vdjserver-web) to compose the web application,
the web api and the web server together. These instructions are mainly to test that production setup
for the web application outside of the production website.

The production setup is configured such that everything resides within the docker image except for
the `environment-config.js` file with the global configuration. This file is mapped into the container.

```
- Clone project and init submodules
git clone http://bitbucket.org/vdjserver/vdjserver-web-backbone.git
cd vdjserver-web-backbone
git submodule update --init --recursive

- Setup local environment config file
cp docker/environment-config/environment-config.js.defaults component/app/scripts/config/environment-config.js
vim component/app/scripts/config/environment-config.js

- Build the docker image
docker build -t vdjserver/backbone .

- Run docker image (with name vdjserver-backbone) with source code directory mounted
docker run -t -p 9001:9001 --rm --name vdjserver-backbone -v $(pwd)/component/app/scripts/config/environment-config.js:/var/www/html/vdjserver-backbone/app/scripts/config/environment-config.js vdjserver/backbone bash -c "npm install && npm run dev && npm start"
```

## Development Guidelines

**Code Style**

 * Code should roughly follow Google Javascript Style Guide conventions: <https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml>.

 * A jscs.rc file (Javascript Code Style Checker) file has been provided in the project repo for any developers who use it.

 * A git pre-commit hook is available via the file pre-commit.sh. To use it, just symlink it as follows: ```ln -s ../../pre-commit.sh .git/hooks/pre-commit```

 * Spaces are preferred over tabs, and indentation is set at 4 spaces.

 *  Vimrc settings: ```set shiftwidth=4, softtabstop=4, expandtab```


**Git Structure**

 * This project uses the Git Flow methodology for code management and development: <https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow>.

 * New development and features should be done on branches that are cloned from the *develop* branch, and then merged into this branch when completed. New release candidates should be branched from *develop*, and then merged into *master* once they have been tested/verified. Once a release branch is ready for production, it should be merged into *master* and tagged appropriately.
