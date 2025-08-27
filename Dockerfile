# Use Node.js 20 (lightweight alpine base)
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only package files first (caching optimization)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your app
COPY . .

# Expose the port your app listens on (adjust if different)
EXPOSE 3000

# Start the app
CMD ["pnpm", "run", "dev"]
