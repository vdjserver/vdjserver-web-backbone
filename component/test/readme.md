VDJServer Backbone GUI Tests
============================

We use the TestCafe framework to automate GUI testing. The tests are written
as integration tests by performing GUI operations then checking the back-end to
verify the data was saved appropriately.

## Building the docker image

A docker image separate from the vdjserver-web-backbone image can be built for
running the tests. This image uses the TestCafe docker image as a base and then installs
additional packages so they can be used in the test code. The docker image can
then be run to test either a local or remote version of the website.

```
# copy default configuration to local env file, edit and provide test and Tapis settings
cp env.default env
emacs env

# Build docker image
docker build -t vdjserver/vdj-backbone-test .
```

## Automated testing within Docker

Run the `check-setup.js` script to verify that configuration settings are populated, and that the
website and Tapis can be connected.

```
docker run --env-file=env --net=host -it vdjserver/vdj-backbone-test chromium /tests/testcafe/check-setup.js
```

To run a specific test suite, specify the filename. Some test suites require the `--disable-native-automation` flag
and specify the `--window-size` for the browser as it can affect the controls visible during the test run.

```
docker run --env-file=env --net=host -it vdjserver/vdj-backbone-test --disable-native-automation chromium '--window-size=1200,800' /tests/testcafe/login.js
```

We have moved to using the TestCafe configuration file, `.testcaferc.js`, for most TestCafe settings, and most flags
and settings can be specified there. TestCafe looks for the configuration file in the current working directory. Browsers
can be specified within the file, but is more convenient to be specified at the command line for docker testing. Only
`chromium` and `firefox` are available by default and follow this structure:

```
docker run --env-file=env --net=host -it vdjserver/vdj-backbone-test chromium /tests/testcafe/login.js
```


## Remote browser testing using Docker

## Test development using Docker

The automated testing copies the test code into the docker image, and thus requires
that the image be rebuilt whenever there is a change to the test code. For faster test
development, the local source code directory can be mounted inside the docker image.

This requires that you have node installed on your local host. You also
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

It is necessary to install `npm` and `node.js` on your local machine to run the tests. On Ubuntu, you would need to run something similar to the following:

```
sudo apt install npm nodejs
```

Next, install TestCafe:

```
npm i -g testcafe
```

From the directory this readme is in, copy the default configuration file, `env.default`, to a local env file, `env`, edit the `env` file, provide test and Tapis settings, and source the `export_env` file:

```
cp env.default env
emacs env
source export_env.sh

```

To check the configuration, navigate to the `testcafe` directory and run the following command:


```
testcafe chrome check-setup.js
```

To run the tests for the login screen, run the command that follows. The `--disable-native-automation` flag allows for the tests to continue if a link opens a new browser window. The chrome option is interchangeable with other browsers and more documentation can be found on the TestCafe site.

```
testcafe --disable-native-automation "chrome '--window-size=1200,800'" login.js
```

To facilitate rigorous testing, use the `.testcaferc.js` TestCafe configuration file to specify TestCafe settings. TestCafe 
looks for this file in the current working directory (we have included a copy in two places, as the docker and local testing options
operate from different directories), and command-line and other flags can be specified within the configuration file:

```
testcafe login.js
```

Browsers may be specified at the command-line or in the configuration file, and the browsers available should match those
available on the local system. Multiple browsers may be specified, but, due to the nature of our tests, concurrency
issues will arise, and it is recommended to run tests in sequence rather than in parallel.

