# Base image
FROM node:18

# Create app directory
WORKDIR /app

# package.json AND pnpm-lock.yaml are copied
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Bundle app source
COPY . .

# Copy the .env file
COPY .env ./

# Build the app. Create a "dist" folder with production build
RUN pnpm build

# Expose the port on which the app will run
EXPOSE 4000

# Run the app using production build
CMD [ "pnpm", "start:prod" ]