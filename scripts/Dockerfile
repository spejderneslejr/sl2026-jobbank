FROM node:22-alpine
WORKDIR /app

# Install production dependencies (includes marked)
COPY package.json .
RUN npm install --omit=dev

# Copy script and its dependencies
COPY scripts/fetch-job-export.js scripts/
COPY scripts/config.json scripts/
COPY src/config/org-overrides.js src/config/

ENV OUTPUT_DIR=/output
RUN mkdir -p /output

CMD ["node", "scripts/fetch-job-export.js"]
