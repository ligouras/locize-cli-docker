#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Fetches the latest version of locize-cli from npm registry
 * @returns {Promise<string>} Latest version string
 */
function fetchLatestVersion() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'registry.npmjs.org',
      path: '/locize-cli/latest',
      method: 'GET',
      headers: {
        'User-Agent': 'locize-cli-docker-version-detector/1.0.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const packageInfo = JSON.parse(data);
          if (!packageInfo.version) {
            reject(new Error('No version field found in npm registry response'));
            return;
          }

          // Validate semantic version format
          const semverRegex = /^\d+\.\d+\.\d+(-[\w\.-]+)?(\+[\w\.-]+)?$/;
          if (!semverRegex.test(packageInfo.version)) {
            reject(new Error(`Invalid semantic version format: ${packageInfo.version}`));
            return;
          }

          resolve(packageInfo.version);
        } catch (error) {
          reject(new Error(`Failed to parse npm registry response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Failed to fetch from npm registry: ${error.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request to npm registry timed out'));
    });

    req.end();
  });
}

/**
 * Reads the current tracked version from file
 * @returns {string} Current version or '0.0.0' if file doesn't exist
 */
function readCurrentVersion() {
  const versionFile = path.join(process.cwd(), '.locize-cli-version');

  try {
    if (fs.existsSync(versionFile)) {
      const version = fs.readFileSync(versionFile, 'utf8').trim();

      // Validate the version format
      const semverRegex = /^\d+\.\d+\.\d+(-[\w\.-]+)?(\+[\w\.-]+)?$/;
      if (!semverRegex.test(version)) {
        console.warn(`Warning: Invalid version format in tracking file: ${version}. Using 0.0.0`);
        return '0.0.0';
      }

      return version;
    }
  } catch (error) {
    console.warn(`Warning: Failed to read version tracking file: ${error.message}. Using 0.0.0`);
  }

  return '0.0.0';
}

/**
 * Compares two semantic versions
 * @param {string} version1
 * @param {string} version2
 * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }

  return 0;
}

/**
 * Sets GitHub Actions output
 * @param {string} name Output name
 * @param {string} value Output value
 */
function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  } else {
    // Fallback for local testing
    console.log(`::set-output name=${name}::${value}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🔍 Detecting locize-cli version changes...');

    // Fetch latest version from npm
    console.log('📡 Fetching latest version from npm registry...');
    const latestVersion = await fetchLatestVersion();
    console.log(`✅ Latest version from npm: ${latestVersion}`);

    // Read current tracked version
    const currentVersion = readCurrentVersion();
    console.log(`📋 Current tracked version: ${currentVersion}`);

    // Determine if we should build
    let shouldBuild = false;
    const forceBuild = process.env.FORCE_BUILD === 'true' || process.argv.includes('--force');

    if (forceBuild) {
      console.log('🔨 Force build requested');
      shouldBuild = true;
    } else {
      const comparison = compareVersions(latestVersion, currentVersion);
      if (comparison > 0) {
        console.log(`🆕 Version changed from ${currentVersion} to ${latestVersion}`);
        shouldBuild = true;
      } else if (comparison === 0) {
        console.log('✅ No version change detected');
      } else {
        console.log(`⚠️  Warning: Latest version (${latestVersion}) is older than tracked version (${currentVersion})`);
      }
    }

    // Set GitHub Actions outputs
    setOutput('new_version', latestVersion);
    setOutput('current_version', currentVersion);
    setOutput('should_build', shouldBuild.toString());

    console.log(`📤 Outputs set:`);
    console.log(`   new_version: ${latestVersion}`);
    console.log(`   current_version: ${currentVersion}`);
    console.log(`   should_build: ${shouldBuild}`);

    // Exit with appropriate code
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);

    // Set error outputs for GitHub Actions
    setOutput('error', error.message);
    setOutput('should_build', 'false');

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchLatestVersion,
  readCurrentVersion,
  compareVersions
};