#!/usr/bin/env node

/**
 * Version Bump Script
 *
 * 앱 버전을 업데이트하는 스크립트
 * Usage: npm run version:patch | version:minor | version:major
 */

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function incrementVersion(version, type) {
  const parts = version.split('.').map(Number);

  switch (type) {
    case 'patch':
      parts[2]++;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    default:
      throw new Error(`Invalid version type: ${type}`);
  }

  return parts.join('.');
}

function updatePackageJson(newVersion) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  packageJson.version = newVersion;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );

  console.log(
    colorize('✓', 'green') + ' Updated package.json to ' + colorize(newVersion, 'cyan'),
  );
}

function updateAndroidVersion(newVersion) {
  const gradlePath = path.join(
    process.cwd(),
    'android',
    'app',
    'build.gradle',
  );

  if (!fs.existsSync(gradlePath)) {
    console.log(colorize('⚠', 'yellow') + ' android/app/build.gradle not found, skipping');
    return;
  }

  let gradle = fs.readFileSync(gradlePath, 'utf8');

  // versionName 업데이트
  gradle = gradle.replace(
    /versionName\s+"[\d.]+"/,
    `versionName "${newVersion}"`,
  );

  // versionCode 증가
  const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);
  if (versionCodeMatch) {
    const currentVersionCode = parseInt(versionCodeMatch[1], 10);
    const newVersionCode = currentVersionCode + 1;
    gradle = gradle.replace(
      /versionCode\s+\d+/,
      `versionCode ${newVersionCode}`,
    );
    console.log(
      colorize('✓', 'green') +
        ` Updated Android versionCode to ${newVersionCode}`,
    );
  }

  fs.writeFileSync(gradlePath, gradle);
  console.log(
    colorize('✓', 'green') +
      ' Updated android/app/build.gradle to ' +
      colorize(newVersion, 'cyan'),
  );
}

function updateIOSVersion(newVersion) {
  const infoPlistPath = path.join(
    process.cwd(),
    'ios',
    'KooDTX',
    'Info.plist',
  );

  if (!fs.existsSync(infoPlistPath)) {
    console.log(colorize('⚠', 'yellow') + ' iOS Info.plist not found, skipping');
    return;
  }

  let plist = fs.readFileSync(infoPlistPath, 'utf8');

  // CFBundleShortVersionString 업데이트
  plist = plist.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)[\d.]+(<\/string>)/,
    `$1${newVersion}$2`,
  );

  // CFBundleVersion 증가
  const versionMatch = plist.match(
    /<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/,
  );
  if (versionMatch) {
    const currentBuildNumber = parseInt(versionMatch[1], 10);
    const newBuildNumber = currentBuildNumber + 1;
    plist = plist.replace(
      /(<key>CFBundleVersion<\/key>\s*<string>)\d+(<\/string>)/,
      `$1${newBuildNumber}$2`,
    );
    console.log(
      colorize('✓', 'green') +
        ` Updated iOS build number to ${newBuildNumber}`,
    );
  }

  fs.writeFileSync(infoPlistPath, plist);
  console.log(
    colorize('✓', 'green') +
      ' Updated ios/KooDTX/Info.plist to ' +
      colorize(newVersion, 'cyan'),
  );
}

function gitCommit(oldVersion, newVersion, type) {
  try {
    execSync('git add package.json android/app/build.gradle ios/*/Info.plist', {
      stdio: 'inherit',
    });

    const commitMessage = `chore(release): bump version from ${oldVersion} to ${newVersion} (${type})`;

    execSync(`git commit -m "${commitMessage}"`, {stdio: 'inherit'});

    console.log(colorize('✓', 'green') + ' Created git commit');

    // Create tag
    execSync(`git tag -a v${newVersion} -m "Release ${newVersion}"`, {
      stdio: 'inherit',
    });

    console.log(colorize('✓', 'green') + ` Created git tag v${newVersion}`);
  } catch (error) {
    console.error(colorize('✗', 'red') + ' Failed to create git commit/tag');
    console.error(error.message);
  }
}

function main() {
  const args = process.argv.slice(2);
  const type = args[0];

  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error(
      colorize('Error:', 'red') +
        ' Invalid version type. Use patch, minor, or major',
    );
    process.exit(1);
  }

  // Read current version
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;

  console.log(
    '\n' + colorize('📦 Version Bump', 'bold') + '\n',
  );
  console.log(`Current version: ${colorize(currentVersion, 'cyan')}`);

  // Calculate new version
  const newVersion = incrementVersion(currentVersion, type);
  console.log(`New version:     ${colorize(newVersion, 'green')}\n`);

  // Confirm
  if (!process.env.CI) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('Proceed? (y/n) ', answer => {
      readline.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted');
        process.exit(0);
      }

      performBump(currentVersion, newVersion, type);
    });
  } else {
    performBump(currentVersion, newVersion, type);
  }
}

function performBump(currentVersion, newVersion, type) {
  console.log('\nUpdating versions...\n');

  // Update files
  updatePackageJson(newVersion);
  updateAndroidVersion(newVersion);
  updateIOSVersion(newVersion);

  console.log('\n' + colorize('✨ Version bump complete!', 'green') + '\n');

  // Git commit
  if (!process.env.NO_GIT) {
    console.log('Creating git commit and tag...\n');
    gitCommit(currentVersion, newVersion, type);
  }

  console.log(
    colorize(
      `\nNext steps:\n  git push && git push --tags\n`,
      'yellow',
    ),
  );
}

main();
