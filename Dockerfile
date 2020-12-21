# Base Image
FROM ubuntu:18.04

MAINTAINER VDJServer <vdjserver@utsouthwestern.edu>

# PROXY: uncomment these if building behind UTSW proxy
ENV http_proxy 'http://proxy.swmed.edu:3128/'
ENV https_proxy 'http://proxy.swmed.edu:3128/'
ENV HTTP_PROXY 'http://proxy.swmed.edu:3128/'
ENV HTTPS_PROXY 'http://proxy.swmed.edu:3128/'

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
    bzip2 \
    libpng-dev \
    python

# node
RUN wget https://nodejs.org/dist/v8.10.0/node-v8.10.0-linux-x64.tar.xz
RUN tar xf node-v8.10.0-linux-x64.tar.xz
RUN cp -rf /node-v8.10.0-linux-x64/bin/* /usr/bin
RUN cp -rf /node-v8.10.0-linux-x64/lib/* /usr/lib
RUN cp -rf /node-v8.10.0-linux-x64/include/* /usr/include
RUN cp -rf /node-v8.10.0-linux-x64/share/* /usr/share

# PROXY: More UTSW proxy settings
RUN npm config set proxy http://proxy.swmed.edu:3128
RUN npm config set https-proxy http://proxy.swmed.edu:3128

RUN mkdir /var/www && mkdir /var/www/html && mkdir /var/www/html/vdjserver-backbone

# Install npm dependencies (optimized for cache)
COPY ./component/package.json /var/www/html/vdjserver-backbone/
RUN cd /var/www/html/vdjserver-backbone && npm install

# Copy project source
COPY ./component/ /var/www/html/vdjserver-backbone

# build dev site
RUN cd /var/www/html/vdjserver-backbone && npm run dev
# build the production site
#RUN cd /var/www/html/vdjserver-backbone && npm run build

WORKDIR /var/www/html/vdjserver-backbone

VOLUME ["/var/www/html/vdjserver-backbone"]
