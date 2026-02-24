# Use alpine image for speed since it's smaller in size
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY app/src/package*.json ./

# Install dependencies
RUN npm install 

# Copy source code
COPY app/src/ .
COPY app/public/ ./public

RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
