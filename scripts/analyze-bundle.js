#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 *
 * React Native 번들 크기를 분석하는 스크립트
 */

const fs = require('fs');
const path = require('path');

// 색상 코드
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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dir, depth = 0) {
  const files = fs.readdirSync(dir);
  let totalSize = 0;
  const results = [];

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      if (
        file !== 'node_modules' &&
        file !== '.git' &&
        file !== 'android' &&
        file !== 'ios' &&
        file !== 'coverage' &&
        !file.startsWith('.')
      ) {
        const dirSize = analyzeDirectory(filePath, depth + 1);
        totalSize += dirSize.total;
        results.push({
          name: file,
          size: dirSize.total,
          type: 'directory',
        });
      }
    } else {
      totalSize += stats.size;
      results.push({
        name: file,
        size: stats.size,
        type: 'file',
      });
    }
  });

  return {total: totalSize, items: results};
}

function printResults(results, title) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(title, 'bold'));
  console.log(colorize('='.repeat(60), 'cyan'));

  results
    .sort((a, b) => b.size - a.size)
    .slice(0, 20)
    .forEach((item, index) => {
      const sizeStr = formatBytes(item.size);
      const icon = item.type === 'directory' ? '📁' : '📄';
      const color = item.size > 1024 * 1024 ? 'red' : item.size > 100 * 1024 ? 'yellow' : 'green';

      console.log(
        `${index + 1}. ${icon} ${item.name}${' '.repeat(40 - item.name.length)}${colorize(
          sizeStr,
          color,
        )}`,
      );
    });
}

function analyzeDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize('📦 Dependencies Analysis', 'bold'));
  console.log(colorize('='.repeat(60), 'cyan'));

  console.log(`\nTotal Dependencies: ${Object.keys(dependencies).length}`);
  console.log(
    `Production: ${Object.keys(packageJson.dependencies || {}).length}`,
  );
  console.log(
    `Development: ${Object.keys(packageJson.devDependencies || {}).length}`,
  );

  // Large dependencies check
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('\n' + colorize('Top 10 Largest Dependencies:', 'bold'));

    const depSizes = [];
    Object.keys(dependencies).forEach(dep => {
      const depPath = path.join(nodeModulesPath, dep);
      if (fs.existsSync(depPath)) {
        const result = analyzeDirectory(depPath, 0);
        depSizes.push({name: dep, size: result.total});
      }
    });

    depSizes
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach((dep, index) => {
        const color = dep.size > 10 * 1024 * 1024 ? 'red' : dep.size > 1024 * 1024 ? 'yellow' : 'green';
        console.log(
          `${index + 1}. ${dep.name}${' '.repeat(45 - dep.name.length)}${colorize(
            formatBytes(dep.size),
            color,
          )}`,
        );
      });
  }
}

function analyzeSourceCode() {
  const srcPath = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcPath)) {
    console.error('src directory not found');
    return;
  }

  const result = analyzeDirectory(srcPath, 0);

  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize('📝 Source Code Analysis', 'bold'));
  console.log(colorize('='.repeat(60), 'cyan'));

  console.log(`\nTotal Source Size: ${colorize(formatBytes(result.total), 'bold')}`);

  printResults(result.items, '\n📊 Top Directories/Files in src/');
}

function printSummary() {
  const srcPath = path.join(process.cwd(), 'src');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');

  let srcSize = 0;
  let nodeModulesSize = 0;

  if (fs.existsSync(srcPath)) {
    srcSize = analyzeDirectory(srcPath, 0).total;
  }

  if (fs.existsSync(nodeModulesPath)) {
    nodeModulesSize = analyzeDirectory(nodeModulesPath, 0).total;
  }

  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize('📊 Summary', 'bold'));
  console.log(colorize('='.repeat(60), 'cyan'));

  console.log(`\nSource Code: ${colorize(formatBytes(srcSize), 'green')}`);
  console.log(`node_modules: ${colorize(formatBytes(nodeModulesSize), 'yellow')}`);
  console.log(
    `Total: ${colorize(formatBytes(srcSize + nodeModulesSize), 'bold')}`,
  );

  // 경고
  if (nodeModulesSize > 500 * 1024 * 1024) {
    console.log(
      '\n' +
        colorize(
          '⚠️  Warning: node_modules is very large (>500MB). Consider removing unused dependencies.',
          'yellow',
        ),
    );
  }

  console.log('\n' + colorize('='.repeat(60), 'cyan') + '\n');
}

// Main
console.log(colorize('\n🔍 React Native Bundle Size Analyzer\n', 'bold'));

analyzeSourceCode();
analyzeDependencies();
printSummary();

console.log(colorize('✨ Analysis complete!\n', 'green'));
