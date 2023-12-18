
function createComponent() {
    const fs = require('fs');
    const path = require('path');

    const componentName = process.argv[2];

    if (!componentName) {
        console.error('Please provide a component name.');
        process.exit(1);
    }

    const rootDirectory = path.resolve(__dirname, '..'); // Assuming scripts/ is one level below the root directory
    const componentDirectory = path.join(rootDirectory, 'src', 'components', componentName);

    // Create the component directory
    fs.mkdirSync(componentDirectory);

    // Create the TypeScript file for the component
    const componentFilePath = path.join(componentDirectory, 'index.tsx');
    const componentContent = `import React from 'react';

    interface ${componentName}Props {
    // Add your component props here
    }

    const ${componentName}: React.FC<${componentName}Props> = () => {
    // Your component logic goes here
    return (
        <div>
        ${componentName} Component
        </div>
    );
    };

    export default ${componentName};
    `;
    fs.writeFileSync(componentFilePath, componentContent);

    // Create the SCSS file for the component
    const scssFilePath = path.join(rootDirectory, 'src', 'styles', 'components', `_${componentName.toLowerCase()}.scss`);
    const scssContent = `.${componentName.toLowerCase()} {
    // Your component styles go here
    }
    `;
    fs.writeFileSync(scssFilePath, scssContent);

    // Update src/styles/index.scss
    const indexScssFilePath = path.join(rootDirectory, 'src', 'styles', 'index.scss');
    const importStatement = `@import './components/${componentName.toLowerCase()}';\n`;
    fs.appendFileSync(indexScssFilePath, importStatement);

    // Update src/pages/Core/index.tsx
    const coreFilePath = path.join(rootDirectory, 'src', 'pages', 'Core', 'index.tsx');
    let coreFileContent = fs.readFileSync(coreFilePath, 'utf-8');

    // Add the import statement
    const importStatementRegex = new RegExp(`import ${componentName} from '../../components/${componentName}';`);
    if (!importStatementRegex.test(coreFileContent)) {
        coreFileContent = coreFileContent.replace(/(import.*?react.*?from 'react';)/, `$1\nimport ${componentName} from '../../components/${componentName}';`);
    }

    // Add the component to the return statement
    const returnStatementRegex = /return\s*\(([\s\S]*?)<Footer \/>([\s\S]*?)<\/div>\s*\);/;
    coreFileContent = coreFileContent.replace(returnStatementRegex, (match, before, after) => {
        const newComponentCode = `<DraggableComponent
            component={${componentName}}
            x={local${componentName}X ? local${componentName}X : ${componentName.toLowerCase()}CurrentX}
            y={local${componentName}Y ? local${componentName}Y : ${componentName.toLowerCase()}CurrentY}
            w={local${componentName}W}
            h={local${componentName}H}
            minHeight={96}
            maxHeight={96}
            minWidth={400}
            maxWidth={972}
            updateContext={updateContext}
            updateDragInit={() => { }}
            localStoragePrefix={'local' + ${componentName}.toLowerCase()}
            dragEnabled={dragEnabled}
            onSearch={() => { }}
        />\n`;

        return `return (${before}${newComponentCode}${after});`;
    });

    fs.writeFileSync(coreFilePath, coreFileContent);

    const indexFile = path.join(__dirname, 'src', 'pages', 'Core', 'index.tsx');
    const indexContent = fs.readFileSync(indexFile, 'utf8');

    const newImport = `import ${componentName} from '../../components/${componentName}';\n`;
    const newVariables = `
    const [local${componentName}X] = useLocalState('local${componentName}X', 0);
    const [local${componentName}Y] = useLocalState('local${componentName}Y', 0);
    const [local${componentName}W] = useLocalState('local${componentName}W', 0);
    const [local${componentName}H] = useLocalState('local${componentName}H', 0);
  
    const ${componentName.toLowerCase()}CurrentX = (window.innerWidth / 2) - 240;
    const ${componentName.toLowerCase()}CurrentY = (window.innerHeight / 2) - 60;
    `;

    const updatedIndexContent = indexContent.replace('import Footer from \'../../components/Footer\';', `import Footer from '../../components/Footer';\n${newImport}`).replace('const gasCurrentY = (window.innerHeight / 2) - 60;', `const gasCurrentY = (window.innerHeight / 2) - 60;\n${newVariables}`);

    fs.writeFileSync(indexFile, updatedIndexContent);

    console.log(`Component '${componentName}' created successfully.`);
}

createComponent();