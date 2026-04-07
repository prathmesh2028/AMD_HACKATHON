# Use lightweight Node environment
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install dependencies first (leverage Docker cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose dynamic environment port (Cloud Run sets this to 8080 usually)
EXPOSE $PORT

# Start the actual server securely
CMD ["npm", "start"]
