# Frontend Dockerfile (place in frontend/ directory)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build argument for environment variable
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Set API base URL to use backend service name
ENV VITE_API_BASE_URL=http://localhost:5000/api

# Expose port 3000
EXPOSE 3000

# Start the development server with host binding on port 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]