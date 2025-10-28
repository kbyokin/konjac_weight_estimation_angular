# Use a compatible Node.js version
FROM node:18

# USER kabin

# Set the working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Expose the Angular app's port
# EXPOSE 4200

# Serve the Angular application
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]