VDJServer Backbone GUI Tests
============================

We use the TestCafe framework to automate GUI testing. The tests are written
as integration tests by performing GUI operations then checking the backend to
verify the data was saved appropriately.

## Building the docker image

A docker image separate from the vdjserver-web-backbone image can be built for
running the tests. This image uses the TestCafe docker image as a base then installs
some additional packages so they can be used in the test code. The docker image can
then be run to test either a locally running version of website or a remote version.

```
# copy default config to local env file, edit and provide test and tapis settings
cp env.default env
emacs env

# Build docker image
docker build -t vdjserver/vdj-backbone-test .
```

The tests can be run in different ways

## Automated testing within Docker

Run the check setup to verify that configuration settings are populated, and the
website and Tapis can be connected.

```
docker run --env-file=env --net=host -it vdjserver/vdj-backbone-test chromium /tests/testcafe/check-setup.js
```

This will start up a browser within Docker and run the tests. When testing against

## Remote browser testing using Docker

## Test development using Docker

The automated testing copies the test code into the docker image, and thus requires
that the image be rebuilt whenever there is a change to the test code. For faster test
development, the local source code directory can be mounted inside the docker image.

This requires that you have node installed on your local host, and then you
need to `npm install` to get the packages that are used by the test code.

```
npm install
```

With the packages now installed in a local `node_modules` directory, you can now run tests
by mapping the local directory.

```
docker run -v .:/tests --env-file=env --net=host -it vdjserver/vdj-backbone-test chromium /tests/testcafe/check-setup.js
```

## Local testing

