# Use Node.js Alpine for both build and serve
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Set the API URL to use the relative /api path (assuming native Nginx will still proxy it)
ENV VITE_API_URL=/api

# Build the frontend application
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Expose HTTP port for the static server
EXPOSE 3000

# Start the application using 'serve' on port 3000, routing all requests to index.html (-s)
CMD ["serve", "-s", "dist", "-l", "3000"]
