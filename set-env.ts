import * as fs from 'fs';
require('dotenv').config({ path: __dirname + '/.env' });
const environment = process.env.ENVIRONMENT;
let apiURL: string;

if (environment === 'production') {
  apiURL = process.env.API_URL;
} else if (environment === 'test') {
  apiURL = process.env.API_URL;
}
const targetPath = `./src/environments/environment.prod.ts`;
const envConfigFile = `
export const environment = {
    production: true,
    apiKey: '${process.env.API_KEY}',
    playlist: '${process.env.PLAYLIST}',
    apiUrl: '${apiURL}'};`;

fs.writeFile(targetPath, envConfigFile, err => {
  if (err) {
    console.log(err);
  }
});
