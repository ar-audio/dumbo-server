FROM node:9.3-alpine

# Create our app directory in the container
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json /usr/src/app/
RUN npm install

# Copy remaining files
COPY . /usr/src/app
