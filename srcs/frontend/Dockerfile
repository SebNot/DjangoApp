# Use an official Nginx image
FROM nginx:alpine

# Copy static files to Nginx serve directory
COPY ./static /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
