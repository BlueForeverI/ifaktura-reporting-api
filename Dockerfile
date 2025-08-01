# --- Stage 1: Build Stage ---
# Use a Node.js image suitable for building (often a -slim or even the default image is fine here)
FROM node:18-slim AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's caching
# This allows npm install to be cached if only the code changes, not dependencies
COPY package*.json ./

# Install project dependencies. Use `npm ci` for clean and reproducible builds,
# and if you have native dependencies that need compilation, these packages might be needed here.
# You might need to add specific build tools here based on your project's native dependencies.
# For many common Node.js apps, this extensive apt install list is not needed.
# If your app requires specific native modules (e.g., for image processing, database drivers),
# you might need a subset of these, but only in this build stage.
# RUN apt update && apt install -y build-essential python3  # Example for common native module needs
RUN npm ci

# Copy the rest of your application code
COPY . .

# If your application has a build step (e.g., TypeScript compilation, Webpack bundling)
# RUN npm run build

# --- Stage 2: Production Stage ---
# Use a much smaller, production-ready Node.js image
FROM node:18-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage to the final image
# This includes `package.json`, `package-lock.json`, and the `node_modules` (production only)
# And your application's source/compiled code.
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules/
# If you have a build step that outputs to a specific directory (e.g., 'dist' or 'build')
# COPY --from=builder /usr/src/app/dist ./dist
# Otherwise, copy the application source code
COPY --from=builder /usr/src/app .
RUN rm -rf /var/lib/apt/lists/*
RUN apt update --allow-releaseinfo-change
RUN apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils

# Set environment for production (if not already handled by your app)
ENV NODE_ENV=production

# Expose the port your application listens on
EXPOSE 5488

# Define the command to run your application
CMD [ "npm", "start" ]