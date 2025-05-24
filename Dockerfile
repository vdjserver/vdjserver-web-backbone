# Base Image
FROM ubuntu:22.04

LABEL MAINTAINER="VDJServer <vdjserver@utsouthwestern.edu>"

# PROXY: uncomment these if building behind UTSW proxy
#ENV http_proxy 'http://proxy.swmed.edu:3128/'
#ENV https_proxy 'http://proxy.swmed.edu:3128/'
#ENV HTTP_PROXY 'http://proxy.swmed.edu:3128/'
#ENV HTTPS_PROXY 'http://proxy.swmed.edu:3128/'

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
    libpng-dev

# node (22.14.0 LTS)
ENV NODE_VER=v22.14.0
ARG TARGETARCH
RUN /bin/sh -c '\
    if [ "$TARGETARCH" = "amd64" ]; then \
      ARCH="x64"; \
    else \
      ARCH="$TARGETARCH"; \
    fi; \
    NODE_DIST=node-${NODE_VER}-linux-${ARCH}; \
    wget https://nodejs.org/dist/${NODE_VER}/$NODE_DIST.tar.xz; \
    tar xf ${NODE_DIST}.tar.xz; \
    cp -rf /${NODE_DIST}/bin/* /usr/bin; \
    cp -rf /${NODE_DIST}/lib/* /usr/lib; \
    cp -rf /${NODE_DIST}/include/* /usr/include; \
    cp -rf /${NODE_DIST}/share/* /usr/share'

##################
##################

# PROXY: More UTSW proxy settings
#RUN npm config set proxy http://proxy.swmed.edu:3128
#RUN npm config set https-proxy http://proxy.swmed.edu:3128

RUN mkdir /var/www && mkdir /var/www/html && mkdir /var/www/html/vdjserver-v2-web-backbone

# build airrvisualizationlibrary from source
COPY ./component/airrvisualizationlibrary/ /var/www/html/vdjserver-v2-web-backbone/airrvisualizationlibrary
RUN cd /var/www/html/vdjserver-v2-web-backbone/airrvisualizationlibrary && npm install
RUN cd /var/www/html/vdjserver-v2-web-backbone/airrvisualizationlibrary && npm run build:dev

# build airr-js
#COPY ./component/airr-standards/ /var/www/html/vdjserver-v2-web-backbone/airr-standards
#RUN cd /var/www/html/vdjserver-v2-web-backbone/airr-standards/lang/js && npm install --unsafe-perm

# build vdjserver-schema and airr-js from source
COPY ./component/vdjserver-schema/ /var/www/html/vdjserver-v2-web-backbone/vdjserver-schema
RUN cd /var/www/html/vdjserver-v2-web-backbone/vdjserver-schema/airr-standards/lang/js && npm install --unsafe-perm
RUN cd /var/www/html/vdjserver-v2-web-backbone/vdjserver-schema && npm install --unsafe-perm

# Install npm dependencies (optimized for cache)
COPY ./component/package.json /var/www/html/vdjserver-v2-web-backbone/
RUN cd /var/www/html/vdjserver-v2-web-backbone && npm install

# Copy project source
COPY ./component/ /var/www/html/vdjserver-v2-web-backbone

# ESLint
RUN cd /var/www/html/vdjserver-v2-web-backbone && npm run eslint app/scripts

# build dev site
RUN cd /var/www/html/vdjserver-v2-web-backbone && npm run dev
# build the production site
#RUN cd /var/www/html/vdjserver-v2-web-backbone && npm run build

WORKDIR /var/www/html/vdjserver-v2-web-backbone

VOLUME ["/var/www/html/vdjserver-v2-web-backbone"]
