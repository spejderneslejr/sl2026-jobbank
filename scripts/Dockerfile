# Lightweight Python image
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Copy the script and config
COPY fetch-job-export.py .
COPY config.json .

# Set output directory environment variable
ENV OUTPUT_DIR=/output

# Create output directory
RUN mkdir -p /output

# Run the script
CMD ["python3", "fetch-job-export.py"]
