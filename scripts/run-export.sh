#!/bin/bash
#
# Run the job export script in a Docker container
#
# Usage:
#   ./run-export.sh /path/to/output/directory
#
# The script will:
#   1. Build the Docker image (if needed)
#   2. Run the container with a bind mount to the specified output directory
#   3. Generate jobs-export.json in the output directory
#

set -e

# Check if output directory argument is provided
if [ -z "$1" ]; then
    echo "Error: Output directory path is required"
    echo ""
    echo "Usage: $0 /path/to/output/directory"
    echo ""
    echo "Example:"
    echo "  $0 /var/www/html/jobbank/public"
    echo ""
    exit 1
fi

OUTPUT_DIR="$1"

# Convert to absolute path
OUTPUT_DIR=$(cd "$(dirname "$OUTPUT_DIR")" && pwd)/$(basename "$OUTPUT_DIR")

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if config.json exists
if [ ! -f "$SCRIPT_DIR/config.json" ]; then
    echo "Error: config.json not found in $SCRIPT_DIR"
    echo ""
    echo "Please create config.json from the template:"
    echo "  cp $SCRIPT_DIR/config.example.json $SCRIPT_DIR/config.json"
    echo ""
    echo "Then edit config.json to add your API keys."
    exit 1
fi

# Docker image name
IMAGE_NAME="sl2026-job-export"

echo "=================================="
echo "SL2026 Job Export Runner"
echo "=================================="
echo "Output directory: $OUTPUT_DIR"
echo "Script directory: $SCRIPT_DIR"
echo ""

# Build the Docker image
echo "Building Docker image..."
docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"
echo ""

# Run the container
echo "Running export..."
docker run --rm \
    -v "$OUTPUT_DIR:/output" \
    "$IMAGE_NAME"

echo ""
echo "=================================="
echo "Export complete!"
echo "=================================="
echo "Output file: $OUTPUT_DIR/jobs-export.json"
