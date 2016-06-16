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

RUN mkdir /var/www && mkdir /var/www/html && mkdir /var/www/html/vdjserver-backbone

# Install npm dependencies (optimized for cache)
COPY ./component/package.json /var/www/html/vdjserver-backbone/
RUN cd /var/www/html/vdjserver-backbone && npm install

# Install bower dependencies
COPY ./component/.bowerrc /var/www/html/vdjserver-backbone/
COPY ./component/bower.json /var/www/html/vdjserver-backbone/
RUN cd /var/www/html/vdjserver-backbone && bower --allow-root install

# Copy project source
COPY ./component/ /var/www/html/vdjserver-backbone

WORKDIR /var/www/html/vdjserver-backbone
RUN ["/usr/local/bin/grunt","build"]

VOLUME ["/var/www/html/vdjserver-backbone/dist"]
