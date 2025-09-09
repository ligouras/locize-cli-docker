# Usage Guide: locize-cli Docker Image

This comprehensive guide covers all aspects of using the locize-cli Docker image, from basic commands to advanced integration scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Volume Mounting Strategies](#volume-mounting-strategies)
- [Environment Variables](#environment-variables)
- [Common Workflows](#common-workflows)
- [CI/CD Integration](#cicd-integration)
- [Advanced Scenarios](#advanced-scenarios)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Basic Usage

### Getting Started

```bash
# Pull the latest image
docker pull ligouras/locize-cli:latest

# Verify installation
docker run --rm ligouras/locize-cli --version

# Show all available commands
docker run --rm ligouras/locize-cli --help
```

### Essential Commands

```bash
# Download translations
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales

# Upload/sync translations
docker run --rm -v $(pwd):/app ligouras/locize-cli sync \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales

# Check project status
docker run --rm ligouras/locize-cli status \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY
```

## Volume Mounting Strategies

### Standard Project Structure

For most projects with translations in a dedicated folder:

```bash
# Project structure:
# my-project/
# ├── src/
# ├── locales/          # Translation files here
# │   ├── en/
# │   ├── de/
# │   └── fr/
# └── package.json

# Mount the entire project
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales
```

### Nested Translation Structure

For projects with translations in multiple locations:

```bash
# Project structure:
# my-app/
# ├── frontend/
# │   └── src/locales/   # Frontend translations
# ├── backend/
# │   └── locales/       # Backend translations
# └── shared/
#     └── locales/       # Shared translations

# Mount specific directories
docker run --rm -v $(pwd)/frontend/src/locales:/app/frontend \
  -v $(pwd)/backend/locales:/app/backend \
  ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./frontend
```

### Monorepo Structure

For monorepos with multiple projects:

```bash
# Monorepo structure:
# workspace/
# ├── packages/
# │   ├── web-app/locales/
# │   ├── mobile-app/locales/
# │   └── shared/locales/
# └── tools/

# Process each package separately
for package in web-app mobile-app shared; do
  docker run --rm -v $(pwd)/packages/$package:/app ligouras/locize-cli sync \
    --project-id YOUR_PROJECT_ID \
    --api-key YOUR_API_KEY \
    --path ./locales \
    --namespace $package
done
```

### Read-Only vs Read-Write Mounting

```bash
# Read-only mount (for download only)
docker run --rm -v $(pwd)/locales:/app/locales:ro ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales

# Read-write mount (for sync operations)
docker run --rm -v $(pwd)/locales:/app/locales:rw ligouras/locize-cli sync \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales
```

## Environment Variables

### Configuration via Environment Variables

```bash
# Set up environment file
cat > .env.locize << EOF
LOCIZE_PROJECT_ID=your-project-id-here
LOCIZE_API_KEY=your-secret-api-key-here
LOCIZE_VERSION=latest
LOCIZE_NAMESPACE=common
EOF

# Use environment file
docker run --rm --env-file .env.locize -v $(pwd):/app ligouras/locize-cli download
```

### Inline Environment Variables

```bash
# Pass variables directly
docker run --rm \
  -e LOCIZE_PROJECT_ID=your-project-id \
  -e LOCIZE_API_KEY=your-api-key \
  -e LOCIZE_VERSION=production \
  -v $(pwd):/app \
  ligouras/locize-cli download --path ./locales
```

### Environment Variable Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOCIZE_PROJECT_ID` | Your locize project identifier | - | `abc123-def456-789` |
| `LOCIZE_API_KEY` | API key for authentication | - | `your-secret-key` |
| `LOCIZE_VERSION` | Version/branch to work with | `latest` | `production`, `staging` |
| `LOCIZE_NAMESPACE` | Namespace to target | `translation` | `common`, `errors` |
| `LOCIZE_REFERENCE_LANGUAGE` | Reference language code | `en` | `en`, `de`, `fr` |
| `HTTP_PROXY` | HTTP proxy server | - | `http://proxy:8080` |
| `HTTPS_PROXY` | HTTPS proxy server | - | `https://proxy:8080` |

## Common Workflows

### 1. Initial Project Setup

```bash
# Step 1: Create project structure
mkdir -p my-project/locales
cd my-project

# Step 2: Download existing translations
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales \
  --clean

# Step 3: Verify downloaded files
ls -la locales/
```

### 2. Development Workflow

```bash
# Download latest translations before development
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales

# Work on your application...

# Upload new keys after development
docker run --rm -v $(pwd):/app ligouras/locize-cli sync \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales \
  --update-missing
```

### 3. Release Preparation

```bash
# Create a release version
docker run --rm ligouras/locize-cli publish \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --version production

# Download production translations
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales \
  --version production
```

### 4. Multi-Language Management

```bash
# Download specific languages only
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales \
  --language en,de,fr,es,it

# Process languages in batches
LANGUAGES=("en,de,fr" "es,it,pt" "ja,ko,zh")
for lang_batch in "${LANGUAGES[@]}"; do
  docker run --rm -v $(pwd):/app ligouras/locize-cli download \
    --project-id YOUR_PROJECT_ID \
    --api-key YOUR_API_KEY \
    --path ./locales \
    --language $lang_batch
done
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Sync Translations

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  sync-translations:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download translations
        run: |
          docker run --rm -v ${{ github.workspace }}:/app ligouras/locize-cli download \
            --project-id ${{ secrets.LOCIZE_PROJECT_ID }} \
            --api-key ${{ secrets.LOCIZE_API_KEY }} \
            --path ./src/locales \
            --clean

      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/locales/
          git diff --staged --quiet || git commit -m "Update translations"
          git push
```

### GitLab CI

```yaml
sync-translations:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker pull ligouras/locize-cli:latest
    - docker run --rm -v $PWD:/app ligouras/locize-cli download
        --project-id $LOCIZE_PROJECT_ID
        --api-key $LOCIZE_API_KEY
        --path ./locales
  artifacts:
    paths:
      - locales/
  only:
    - schedules
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any

    environment {
        LOCIZE_PROJECT_ID = credentials('locize-project-id')
        LOCIZE_API_KEY = credentials('locize-api-key')
    }

    stages {
        stage('Download Translations') {
            steps {
                script {
                    docker.image('ligouras/locize-cli:latest').inside('-v $WORKSPACE:/app') {
                        sh '''
                            locize download \
                                --project-id $LOCIZE_PROJECT_ID \
                                --api-key $LOCIZE_API_KEY \
                                --path ./locales
                        '''
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                // Your build steps here
                sh 'npm run build'
            }
        }
    }
}
```

### Azure DevOps

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  LOCIZE_PROJECT_ID: $(locize.project.id)
  LOCIZE_API_KEY: $(locize.api.key)

steps:
- script: |
    docker run --rm -v $(Build.SourcesDirectory):/app ligouras/locize-cli download \
      --project-id $(LOCIZE_PROJECT_ID) \
      --api-key $(LOCIZE_API_KEY) \
      --path ./locales
  displayName: 'Download Translations'

- script: |
    npm install
    npm run build
  displayName: 'Build Application'
```

## Advanced Scenarios

### Custom Configuration Files

```bash
# Create locize configuration file
cat > locize.json << EOF
{
  "projectId": "your-project-id",
  "apiKey": "your-api-key",
  "version": "latest",
  "namespace": "translation",
  "referenceLng": "en",
  "fallbackLng": "en",
  "path": "./locales"
}
EOF

# Use configuration file
docker run --rm -v $(pwd):/app ligouras/locize-cli download --config ./locize.json
```

### Migration from Other Systems

```bash
# Migrate from i18next JSON files
docker run --rm -v $(pwd):/app ligouras/locize-cli migrate \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./old-translations \
  --format i18next \
  --replace

# Migrate from CSV files
docker run --rm -v $(pwd):/app ligouras/locize-cli migrate \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./translations.csv \
  --format csv \
  --delimiter ";"
```

### Batch Operations

```bash
# Process multiple projects
PROJECTS=("project-1" "project-2" "project-3")
API_KEYS=("key-1" "key-2" "key-3")

for i in "${!PROJECTS[@]}"; do
  echo "Processing ${PROJECTS[$i]}..."
  docker run --rm -v $(pwd):/app ligouras/locize-cli download \
    --project-id "${PROJECTS[$i]}" \
    --api-key "${API_KEYS[$i]}" \
    --path "./locales/${PROJECTS[$i]}"
done
```

### Custom Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  locize-sync:
    image: ligouras/locize-cli:latest
    volumes:
      - ./locales:/app/locales
      - ./scripts:/app/scripts
    environment:
      - LOCIZE_PROJECT_ID=${LOCIZE_PROJECT_ID}
      - LOCIZE_API_KEY=${LOCIZE_API_KEY}
    command: sync --path ./locales

  locize-download:
    image: ligouras/locize-cli:latest
    volumes:
      - ./locales:/app/locales
    environment:
      - LOCIZE_PROJECT_ID=${LOCIZE_PROJECT_ID}
      - LOCIZE_API_KEY=${LOCIZE_API_KEY}
    command: download --path ./locales --clean
```

```bash
# Use with docker-compose
docker-compose run locize-download
docker-compose run locize-sync
```

## Best Practices

### Security

1. **Never expose API keys in logs**:
   ```bash
   # ❌ Bad - API key visible in process list
   docker run --rm ligouras/locize-cli download --api-key secret-key

   # ✅ Good - Use environment variables
   docker run --rm -e LOCIZE_API_KEY=secret-key ligouras/locize-cli download
   ```

2. **Use secrets management**:
   ```bash
   # Store secrets securely
   echo "your-api-key" | docker secret create locize-api-key -

   # Use in swarm mode
   docker service create \
     --secret locize-api-key \
     --env LOCIZE_API_KEY_FILE=/run/secrets/locize-api-key \
     ligouras/locize-cli
   ```

3. **Limit container permissions**:
   ```bash
   # Run with specific user ID
   docker run --rm --user $(id -u):$(id -g) -v $(pwd):/app ligouras/locize-cli download

   # Use read-only root filesystem when possible
   docker run --rm --read-only -v $(pwd):/app ligouras/locize-cli download
   ```

### Performance

1. **Use specific versions for production**:
   ```bash
   # ❌ Avoid in production
   docker run --rm ligouras/locize-cli:latest

   # ✅ Use specific versions
   docker run --rm ligouras/locize-cli:10.3.1
   ```

2. **Optimize volume mounts**:
   ```bash
   # Mount only necessary directories
   docker run --rm -v $(pwd)/locales:/app/locales ligouras/locize-cli download --path ./locales
   ```

3. **Use multi-stage builds for custom images**:
   ```dockerfile
   FROM ligouras/locize-cli:latest as locize
   FROM node:alpine
   COPY --from=locize /usr/local/bin/locize /usr/local/bin/
   # Your application code here
   ```

### Reliability

1. **Always use `--rm` flag**:
   ```bash
   # Automatically remove container after execution
   docker run --rm ligouras/locize-cli download
   ```

2. **Implement retry logic**:
   ```bash
   #!/bin/bash
   retry_count=0
   max_retries=3

   while [ $retry_count -lt $max_retries ]; do
     if docker run --rm -v $(pwd):/app ligouras/locize-cli download \
       --project-id $LOCIZE_PROJECT_ID \
       --api-key $LOCIZE_API_KEY \
       --path ./locales; then
       echo "Download successful"
       break
     else
       retry_count=$((retry_count + 1))
       echo "Attempt $retry_count failed, retrying..."
       sleep 5
     fi
   done
   ```

3. **Validate results**:
   ```bash
   # Download and verify
   docker run --rm -v $(pwd):/app ligouras/locize-cli download \
     --project-id $LOCIZE_PROJECT_ID \
     --api-key $LOCIZE_API_KEY \
     --path ./locales

   # Check if files were created
   if [ -d "locales" ] && [ "$(ls -A locales)" ]; then
     echo "Translation files downloaded successfully"
   else
     echo "Download failed - no files found"
     exit 1
   fi
   ```

## Troubleshooting

### Common Issues

#### Permission Denied Errors

**Problem**: Cannot write to mounted volumes
```
Error: EACCES: permission denied, open '/app/locales/en/common.json'
```

**Solutions**:
```bash
# Option 1: Match user IDs
docker run --rm --user $(id -u):$(id -g) -v $(pwd):/app ligouras/locize-cli download

# Option 2: Fix permissions after
docker run --rm -v $(pwd):/app ligouras/locize-cli download
sudo chown -R $(id -u):$(id -g) locales/

# Option 3: Use a wrapper script
cat > download.sh << 'EOF'
#!/bin/bash
docker run --rm -v $(pwd):/app ligouras/locize-cli download "$@"
sudo chown -R $(id -u):$(id -g) locales/
EOF
chmod +x download.sh
./download.sh --project-id YOUR_PROJECT_ID --api-key YOUR_API_KEY
```

#### Network Connectivity Issues

**Problem**: Cannot reach locize API
```
Error: connect ECONNREFUSED api.locize.app:443
```

**Solutions**:
```bash
# Check network connectivity
docker run --rm alpine ping -c 3 api.locize.app

# Use proxy if needed
docker run --rm \
  -e HTTP_PROXY=http://proxy:8080 \
  -e HTTPS_PROXY=http://proxy:8080 \
  -v $(pwd):/app \
  ligouras/locize-cli download

# Use custom DNS
docker run --rm --dns 8.8.8.8 -v $(pwd):/app ligouras/locize-cli download
```

#### Path Resolution Issues

**Problem**: Files not found or created in wrong location
```
Error: ENOENT: no such file or directory, scandir '/app/wrong-path'
```

**Solutions**:
```bash
# Debug volume mounting
docker run --rm -v $(pwd):/app ligouras/locize-cli sh -c "pwd && ls -la"

# Use absolute paths in container
docker run --rm -v $(pwd)/locales:/app/locales ligouras/locize-cli download --path /app/locales

# Verify working directory
docker run --rm -v $(pwd):/app -w /app ligouras/locize-cli download --path ./locales
```

#### API Authentication Issues

**Problem**: Invalid credentials or permissions
```
Error: Unauthorized (401)
```

**Solutions**:
```bash
# Verify credentials
docker run --rm ligouras/locize-cli status \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY

# Check API key permissions in locize dashboard
# Ensure API key has read/write permissions as needed

# Test with minimal command
docker run --rm ligouras/locize-cli languages \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY
```

### Debugging Commands

```bash
# Get detailed version information
docker run --rm ligouras/locize-cli --version

# Check container internals
docker run --rm -it --entrypoint sh ligouras/locize-cli

# Test with verbose output
docker run --rm -v $(pwd):/app ligouras/locize-cli download \
  --project-id YOUR_PROJECT_ID \
  --api-key YOUR_API_KEY \
  --path ./locales \
  --verbose

# Inspect image layers
docker history ligouras/locize-cli:latest

# Check running processes
docker run --rm ligouras/locize-cli sh -c "ps aux"
```

### Getting Help

1. **Check logs**: Always review the complete output for error details
2. **Verify setup**: Ensure Docker, volumes, and credentials are correct
3. **Test incrementally**: Start with simple commands and add complexity
4. **Check documentation**: Review [locize-cli docs](https://github.com/locize/locize-cli) for command-specific help
5. **Community support**: Ask questions in [GitHub Discussions](https://github.com/ligouras/locize-cli-docker/discussions)

---

This usage guide covers the most common scenarios and best practices for using the locize-cli Docker image. For additional help or specific use cases not covered here, please refer to the [main README](README.md) or open an issue in the repository.