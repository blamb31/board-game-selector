const fs = require('fs');
const path = require('path');

// Determine the token from the environment variable
const token = process.env.BGG_BEARER_TOKEN || '23340cae-6153-4ae2-a085-122ce908ba41';

const targetPath = path.join(__dirname, '../src/environments/environment.prod.ts');
const targetPathDev = path.join(__dirname, '../src/environments/environment.ts');

const envConfigFileProd = `export const environment = {
  production: true,
  bearerToken: '${token}'
};
`;

const envConfigFileDev = `export const environment = {
  production: false,
  bearerToken: '${token}'
};
`;

const dirPath = path.join(__dirname, '../src/environments');

// Ensure the directory exists
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
}

fs.writeFileSync(targetPath, envConfigFileProd);
console.log(`Output generated at ${targetPath}`);

fs.writeFileSync(targetPathDev, envConfigFileDev);
console.log(`Output generated at ${targetPathDev}`);
