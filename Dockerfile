# Use the official Node.js Alpine image as the base
FROM node:alpine

# Build arguments for version pinning and metadata
ARG LOCIZE_CLI_VERSION=latest
ARG BUILD_DATE
ARG VCS_REF

# Set OCI-compliant metadata labels
LABEL org.opencontainers.image.title="locize-cli"
LABEL org.opencontainers.image.description="Docker image for locize-cli tool - A command line interface for locize translation management platform"
LABEL org.opencontainers.image.version="${LOCIZE_CLI_VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.source="https://github.com/ligouras/locize-cli-docker"
LABEL org.opencontainers.image.url="https://github.com/ligouras/locize-cli-docker"
LABEL org.opencontainers.image.documentation="https://github.com/ligouras/locize-cli-docker#readme"
LABEL org.opencontainers.image.vendor="ligouras"
LABEL org.opencontainers.image.licenses="MIT"
LABEL maintainer="locize-cli-docker"

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S locize -u 1001

# Install specific version of locize-cli globally
RUN npm install -g locize-cli@${LOCIZE_CLI_VERSION}

# Verification step to ensure correct version is installed
RUN locize --version

# Switch to non-root user
USER locize

# Set the working directory
WORKDIR /app

# Set the entrypoint to the locize command
ENTRYPOINT ["locize"]

# Default command (show help)
CMD ["--help"]