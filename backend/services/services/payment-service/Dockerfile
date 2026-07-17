FROM node:20-slim

WORKDIR /usr/src/app

# Copy dependency manifests first
COPY package*.json ./

# Install clean, production-only packages
RUN npm ci --only=production

# Copy the rest of your microservice code files
COPY . .

# Inform Docker that this container listens on an environment port
EXPOSE $PORT

# Start your microservice
CMD ["node", "server.js"]
