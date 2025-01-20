const fs = require('fs');
const path = require('path');

// Função recursiva para gerar o mapa de pastas/arquivos
function generateFileStructure(dir, depth = 0) {
    let structure = '';
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();

        structure += `${'  '.repeat(depth)}- ${file}\n`;

        if (isDirectory) {
            structure += generateFileStructure(filePath, depth + 1);
        }
    });

    return structure;
}

// Caminhos do backend e frontend
const backendDir = path.join(__dirname, '/src');
const frontendDir = path.join(__dirname, '../frontend/src');
const mobileDir = path.join(__dirname, "../mobile");

// Gerar mapas de ambos os diretórios
let output = 'Estrutura de Arquivos do Projeto\n\n';
output += 'Backend:\n';
output += generateFileStructure(backendDir);
output += '\nFrontend:\n';
output += generateFileStructure(frontendDir);
output += '\nMobile:\n';
output += generateFileStructure(mobileDir);

// Exibir no console
console.log(output);

// Opcional: salvar em um arquivo
const outputPath = path.join(__dirname, 'estrutura_projeto.txt');
fs.writeFileSync(outputPath, output);
console.log(`Estrutura salva em: ${outputPath}`);
