# Use Node.js 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 3001
EXPOSE 3001

# Start the application using vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3001"]