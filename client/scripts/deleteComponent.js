const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];

if (!componentName) {
  console.error('Please provide a component name.');
  process.exit(1);
}

const rootDirectory = path.resolve(__dirname, '..'); // Assuming scripts/ is one level below the root directory
const componentDirectory = path.join(rootDirectory, 'src', 'components', componentName);
const scssFilePath = path.join(rootDirectory, 'src', 'styles', 'components', `_${componentName.toLowerCase()}.scss`);

if (fs.existsSync(componentDirectory)) {
  // The component directory exists; delete it.
  fs.rmdirSync(componentDirectory, { recursive: true });
  console.log(`Component '${componentName}' and its contents deleted successfully.`);
} else {
  console.log(`Component '${componentName}' does not exist.`);
}

if (fs.existsSync(scssFilePath)) {
  // The SCSS file exists; delete it.
  fs.unlinkSync(scssFilePath);
  console.log(`SCSS file '_${componentName.toLowerCase()}.scss' deleted successfully.`);
} else {
  console.log(`SCSS file '_${componentName.toLowerCase()}.scss' does not exist.`);
}
