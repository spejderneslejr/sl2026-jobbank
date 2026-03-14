FROM node:22-alpine
WORKDIR /app

# Install dependencies (marked)
COPY package.json .
RUN npm install

COPY fetch-job-export.js .
COPY org-overrides.js .
COPY config.json .

ENV OUTPUT_DIR=/output
RUN mkdir -p /output

CMD ["node", "fetch-job-export.js"]
