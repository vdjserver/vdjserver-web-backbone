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
# Make config file from default config
# Edit and provide test username and password, and hostname where website is running
cp env.default env

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

## Local testing

