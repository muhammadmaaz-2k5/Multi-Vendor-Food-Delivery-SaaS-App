const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const sourceFiles = project.getSourceFiles('src/**/*.ts');

for (const sourceFile of sourceFiles) {
  let hasModifications = false;
  
  // 1. Handle Imports
  const importDeclarations = sourceFile.getImportDeclarations();
  for (const importDecl of importDeclarations) {
    if (importDecl.isTypeOnly()) {
      // It's `import type ...`, leave it alone
      // Just strip .js if it's there
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier.endsWith('.js')) {
        importDecl.setModuleSpecifier(moduleSpecifier.slice(0, -3));
        hasModifications = true;
      }
      continue;
    }

    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    const newModuleSpecifier = moduleSpecifier.endsWith('.js') ? moduleSpecifier.slice(0, -3) : moduleSpecifier;
    
    const defaultImport = importDecl.getDefaultImport();
    const namedImports = importDecl.getNamedImports();
    const namespaceImport = importDecl.getNamespaceImport();

    // Check if named imports are type only
    const valueImports = namedImports.filter(n => !n.isTypeOnly());
    const typeImports = namedImports.filter(n => n.isTypeOnly());

    let requireStatement = '';
    
    if (defaultImport) {
      requireStatement += `const ${defaultImport.getText()} = require('${newModuleSpecifier}');\n`;
    }
    
    if (namespaceImport) {
      requireStatement += `const ${namespaceImport.getText()} = require('${newModuleSpecifier}');\n`;
    }
    
    if (valueImports.length > 0) {
      const names = valueImports.map(n => n.getText()).join(', ');
      requireStatement += `const { ${names} } = require('${newModuleSpecifier}');\n`;
    }

    // Replace the import declaration
    if (requireStatement) {
      // If there are type imports, keep them as import type
      if (typeImports.length > 0) {
        const typeNames = typeImports.map(n => n.getName()).join(', ');
        importDecl.replaceWithText(`import type { ${typeNames} } from '${newModuleSpecifier}';\n${requireStatement}`);
      } else {
        importDecl.replaceWithText(requireStatement);
      }
      hasModifications = true;
    } else {
      // Only type imports remain (e.g. they were mixed but all were types or something, or it was bare import)
      if (typeImports.length > 0) {
         // It's basically a type import now
      } else if (!defaultImport && !namespaceImport) {
         // Bare import: import './something'
         importDecl.replaceWithText(`require('${newModuleSpecifier}');`);
         hasModifications = true;
      }
    }
  }

  // 2. Handle Exports
  
  // Default exports
  const exportAssignments = sourceFile.getExportAssignments();
  for (const exportAssignment of exportAssignments) {
    if (!exportAssignment.isExportEquals()) {
       // export default ...
       const expr = exportAssignment.getExpression();
       exportAssignment.replaceWithText(`module.exports = ${expr.getText()};`);
       hasModifications = true;
    }
  }

  // Named exports
  const exportDeclarations = sourceFile.getExportDeclarations();
  for (const exportDecl of exportDeclarations) {
    if (exportDecl.isTypeOnly()) continue;
    if (exportDecl.hasNamedExports()) {
      const namedExports = exportDecl.getNamedExports();
      let text = '';
      for (const ne of namedExports) {
        text += `exports.${ne.getName()} = ${ne.getName()};\n`;
      }
      exportDecl.replaceWithText(text);
      hasModifications = true;
    }
  }

  // Variable exports (export const x = 1)
  const variableStatements = sourceFile.getVariableStatements();
  for (const varStmt of variableStatements) {
    if (varStmt.hasExportKeyword()) {
      varStmt.setIsExported(false);
      const decls = varStmt.getDeclarations();
      let exportText = '';
      for (const decl of decls) {
        exportText += `exports.${decl.getName()} = ${decl.getName()};\n`;
      }
      // insert exports after the statement
      const pos = varStmt.getChildIndex();
      sourceFile.insertStatements(pos + 1, exportText);
      hasModifications = true;
    }
  }

  // Function exports
  const functions = sourceFile.getFunctions();
  for (const func of functions) {
    if (func.hasExportKeyword() && !func.hasDefaultKeyword()) {
      func.setIsExported(false);
      const name = func.getName();
      if (name) {
        const pos = func.getChildIndex();
        sourceFile.insertStatements(pos + 1, `exports.${name} = ${name};`);
        hasModifications = true;
      }
    }
  }

  // Class exports
  const classes = sourceFile.getClasses();
  for (const cls of classes) {
    if (cls.hasExportKeyword() && !cls.hasDefaultKeyword()) {
      cls.setIsExported(false);
      const name = cls.getName();
      if (name) {
        const pos = cls.getChildIndex();
        sourceFile.insertStatements(pos + 1, `exports.${name} = ${name};`);
        hasModifications = true;
      }
    }
  }

  if (hasModifications) {
    sourceFile.saveSync();
    console.log(`Transformed ${sourceFile.getFilePath()}`);
  }
}
