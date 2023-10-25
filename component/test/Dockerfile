# Base Image
FROM testcafe/testcafe

MAINTAINER VDJServer <vdjserver@utsouthwestern.edu>

# switch to root to install more stuff
USER root

RUN npm list -g
RUN mkdir /tests

# Copy tests
COPY ./ /tests

RUN cd /tests && npm install
RUN npm list
RUN cd /tests && npm list

WORKDIR /tests
