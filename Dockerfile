# Base Image
FROM debian:jessie

MAINTAINER Walter Scarborough <wscarbor@tacc.utexas.edu>

# Install OS Dependencies
RUN apt-get update && apt-get install -y \
    git \
    nodejs \
    nodejs-legacy \
    npm \
    ruby \
    ruby-dev \
    vim \
    xdg-utils

RUN npm install -g \
    bower \
    grunt \
    grunt-cli

# Install sass dependencies
RUN gem install \
    sass \
    compass

RUN mkdir /vdjserver-backbone

# Install npm dependencies (optimized for cache)
COPY package.json /vdjserver-backbone/
RUN cd /vdjserver-backbone && npm install

# Install bower dependencies
COPY .bowerrc /vdjserver-backbone/
COPY bower.json /vdjserver-backbone/
RUN cd /vdjserver-backbone && bower --allow-root install

# Copy project source
COPY . /vdjserver-backbone

WORKDIR /vdjserver-backbone
ENTRYPOINT ["/usr/local/bin/grunt"]
#CMD "/usr/local/bin/grunt --gruntfile /vdjserver-backbone/Gruntfile.js --help"
#ENTRYPOINT ["/usr/local/bin/grunt
#CMD ["--gruntfile /vdjserver-backbone/Gruntfile.js"]
CMD ["--help"]
