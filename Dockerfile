FROM node:16.13-alpine3.12

WORKDIR /home/node/app
# ADD . .

# ENV NODE_ENV=production
# Only copy the package.json file to work directory
COPY package*.json ./

# Install all Packages
RUN npm ci \
    && npm cache verify \
    && npm cache clean --force

# Copy all other source code to work directory
COPY . .

# Start
CMD [ "npm", "start" ]

EXPOSE 6969
