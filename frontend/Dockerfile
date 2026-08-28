# Use Node.js Alpine for both build and serve
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Use ARG so Vite can read it at BUILD TIME (this is the critical fix)
ARG VITE_API_URL=/api
ARG VITE_BASE_URL=""
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}

# Build the frontend application
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Expose HTTP port for the static server
EXPOSE 3001

# Start the application using 'serve' on port 3001, routing all requests to index.html (-s)
CMD ["serve", "-s", "dist", "-l", "3001"]
