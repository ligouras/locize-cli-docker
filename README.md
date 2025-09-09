# locize-cli Docker Image

[![Docker Hub](https://img.shields.io/docker/pulls/ligouras/locize-cli)](https://hub.docker.com/r/ligouras/locize-cli)
[![Build Status](https://github.com/ligouras/locize-cli-docker/actions/workflows/build-and-publish.yml/badge.svg)](https://github.com/ligouras/locize-cli-docker/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready Docker image for the [locize-cli](https://github.com/locize/locize-cli) tool, providing a containerized command line interface for the locize translation management platform.

## Why Use This Docker Image?

### Benefits Over Local Installation
- **No Node.js Required**: Run locize-cli without installing Node.js or managing npm dependencies
- **Consistent Environment**: Same behavior across development, CI/CD, and production environments
- **Isolation**: Avoid conflicts with other Node.js projects or global packages
- **Multi-Platform Support**: Works on AMD64 and ARM64 architectures (including Apple Silicon)
- **Security**: Runs as non-root user with minimal attack surface
- **Always Updated**: Automated builds ensure you get the latest locize-cli versions

### Perfect For
- **CI/CD Pipelines**: Integrate translation workflows into your deployment process
- **Docker-First Teams**: Maintain consistency with containerized development workflows
- **Multi-Project Environments**: Avoid version conflicts between different projects
- **Production Deployments**: Reliable, tested container images for production use

## Installation

### Option 1: Docker Hub (Recommended)
```bash
docker pull ligouras/locize-cli:latest
```

### Option 2: Build Locally
```bash
git clone https://github.com/ligouras/locize-cli-docker.git
cd locize-cli-docker
npm run build
```

## Quick Start

### Basic Commands
```bash
# Show help
docker run --rm ligouras/locize-cli --help

# Check version
docker run --rm ligouras/locize-cli --version

# List available commands
docker run --rm ligouras/locize-cli
```

### Working with Local Files
```bash
# Download translations to current directory
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales

# Upload/sync translations from current directory
docker run --rm -v $(pwd):/app ligouras/locize-cli sync \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales
```

### Using Environment Variables
```bash
# Set credentials via environment variables
docker run --rm \
  -e LOCIZE_PROJECT_ID=your-project-id \
  -e LOCIZE_API_KEY=your-api-key \
  -v $(pwd):/app \
  ligouras/locize-cli download --path ./locales
```

## Common Use Cases

### 1. Download Translations
```bash
# Download specific languages
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales \
  --language en,de,fr,es
```

### 2. Sync Translations
```bash
# Sync all changes (upload and download)
docker run --rm -v $(pwd):/app ligouras/locize-cli sync \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales
```

### 3. Migrate from Other Formats
```bash
# Migrate from i18next format
docker run --rm -v $(pwd):/app ligouras/locize-cli migrate \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./old-locales \
  --format i18next
```

### 4. CI/CD Integration
```yaml
# GitHub Actions example
- name: Download translations
  run: |
    docker run --rm -v ${{ github.workspace }}:/app ligouras/locize-cli download \
      --project-id ${{ secrets.LOCIZE_PROJECT_ID }} \
      --api-key ${{ secrets.LOCIZE_API_KEY }} \
      --path ./src/locales
```

For detailed usage examples and best practicies check the **[Usage Guide](USAGE.md)**

## Available npm Scripts

For local development and testing:

```bash
npm run build          # Build the Docker image
npm run build:tag      # Build with version tags
npm run run            # Run container interactively
npm run run:help       # Show locize-cli help
npm run run:version    # Show locize-cli version
npm run shell          # Access container shell for debugging
npm run clean          # Remove the Docker image
npm run test           # Run tests (validates image functionality)
npm run docs:validate  # Validate documentation
npm run docs:serve     # Serve documentation locally
```

## Image Details

### Base Image
- **Base**: `node:alpine` (minimal, secure, regularly updated)
- **Size**: ~50MB compressed
- **Platforms**: `linux/amd64`, `linux/arm64`

### Security Features
- **Non-root user**: Runs as `locize` user (UID 1001)
- **Minimal surface**: Only essential packages included
- **Regular updates**: Automated builds with latest base images

### Image Tags
- `latest` - Always points to the most recent stable version
- `X.Y.Z` - Specific version tags (e.g., `10.3.1`)
- Available on Docker Hub

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LOCIZE_PROJECT_ID` | Your locize project ID | `abc123def-456-789` |
| `LOCIZE_API_KEY` | Your locize API key | `your-secret-api-key` |
| `LOCIZE_VERSION` | Specific version to use | `latest` or `production` |
| `LOCIZE_NAMESPACE` | Target namespace | `common` |

## Requirements

- **Docker**: 20.0.0 or higher
- **For local builds**: Node.js 14.0.0 or higher (for npm scripts)
- **For development**: Git, Docker Buildx (for multi-platform builds)

## Related Projects

- **[locize-cli](https://github.com/locize/locize-cli)** - The original CLI tool

---

*This Docker image is maintained independently and is not officially affiliated with locize, though it packages their excellent CLI tool.*