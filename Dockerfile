# Base Image
FROM ubuntu:16.04

MAINTAINER VDJServer <vdjserver@utsouthwestern.edu>

# PROXY: uncomment these if building behind UTSW proxy
#ENV http_proxy 'http://proxy.swmed.edu:3128/'
#ENV https_proxy 'https://proxy.swmed.edu:3128/'
#ENV HTTP_PROXY 'http://proxy.swmed.edu:3128/'
#ENV HTTPS_PROXY 'https://proxy.swmed.edu:3128/'

# Install OS Dependencies
RUN apt-get update && apt-get install -y \
    make \
    gcc g++ \
    git \
    ruby \
    ruby-dev \
    vim \
    xdg-utils \
    wget \
    xz-utils \
    bzip2

# node
RUN wget https://nodejs.org/dist/v8.10.0/node-v8.10.0-linux-x64.tar.xz
RUN tar xf node-v8.10.0-linux-x64.tar.xz
RUN cp -rf /node-v8.10.0-linux-x64/bin/* /usr/bin
RUN cp -rf /node-v8.10.0-linux-x64/lib/* /usr/lib
RUN cp -rf /node-v8.10.0-linux-x64/include/* /usr/include
RUN cp -rf /node-v8.10.0-linux-x64/share/* /usr/share

# PROXY: More UTSW proxy settings
#RUN npm config set proxy http://proxy.swmed.edu:3128
#RUN npm config set https-proxy http://proxy.swmed.edu:3128

RUN npm install -g \
    bower \
    grunt-cli

# Install sass dependencies
RUN gem install sass -v 3.4.25
RUN gem install compass

RUN mkdir /var/www && mkdir /var/www/html && mkdir /var/www/html/vdjserver-backbone

# Install npm dependencies (optimized for cache)
COPY ./component/package.json /var/www/html/vdjserver-backbone/
RUN cd /var/www/html/vdjserver-backbone && npm install

# Install bower dependencies
COPY ./component/.bowerrc /var/www/html/vdjserver-backbone/
# PROXY: Copy .bowerrc with proxy settings
#COPY ./component/.bowerrc.proxy /var/www/html/vdjserver-backbone/.bowerrc

COPY ./component/bower.json /var/www/html/vdjserver-backbone/
RUN cd /var/www/html/vdjserver-backbone && bower --allow-root install

# Copy project source
RUN mkdir /var/www/html/airr-standards
COPY ./airr-standards/ /var/www/html/airr-standards
COPY ./component/ /var/www/html/vdjserver-backbone
RUN cd /var/www/html/vdjserver-backbone/test && bower --allow-root install

WORKDIR /var/www/html/vdjserver-backbone
RUN ["/usr/bin/grunt","build"]

VOLUME ["/var/www/html/vdjserver-backbone"]
