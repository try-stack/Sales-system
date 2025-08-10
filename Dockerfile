FROM node:22.15.1
# Use a specific version of Node.js         
LABEL maintainer="Trymore <tmagara49@gmail.com>"
# Set the working directory
WORKDIR /usr/src/app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install --production
# Copy the rest of the application code
COPY . .
# Expose the application port
EXPOSE 3000
# Start the application
CMD ["node", "app.js"]
