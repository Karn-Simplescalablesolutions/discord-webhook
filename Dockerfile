# Step 1: Use an official Node.js image from Docker Hub
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Install curl and unzip (we'll use curl instead of wget)
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && curl -s https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip -o ngrok-stable-linux-amd64.zip \
    && unzip ngrok-stable-linux-amd64.zip \
    && mv ngrok /usr/local/bin

# Step 4: Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Step 5: Install the application dependencies
RUN npm install

# Step 6: Copy the rest of the application files
COPY . .

# Step 7: Expose the port the application will run on
EXPOSE 3000

# Step 8: Command to run the application
CMD ["node", "index.js"]
