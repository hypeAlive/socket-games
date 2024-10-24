const fs = require('fs');
const path = require('path');

function loadAngularConfig() {
    const angularConfigPath = path.resolve(__dirname, 'angular.json');
    return JSON.parse(fs.readFileSync(angularConfigPath, 'utf8'));
}

const languages = [];

function getLanguagesFromConfig() {
    const config = loadAngularConfig();
    const portfolio = config.projects.frontend;
    const sourceLocale = portfolio.i18n.sourceLocale;
    const locales = portfolio.i18n.locales;

    const removeSlash = (str) => str.replace('/', '');

    languages.push(removeSlash(sourceLocale));

    for (const locale in locales) {
        if (locales.hasOwnProperty(locale)) {
            languages.push(removeSlash(locale));
        }
    }
}

function generateHttp() {
    const mapEntries = languages.map(lang => `~*^${lang} ${lang};`).join('\n      ');
    return `http {
    include       mime.types;
    default_type  application/octet-stream;

    map $http_accept_language $accept_language {
      ${mapEntries}
    }

    include /etc/nginx/conf.d/*.conf;
}`;
}

function generateServer() {
    const languagesString = languages.map(lang => lang).join('|');
    return `server {
    listen 80;
    server_name 0.0.0.0;
    root /usr/share/nginx/html;

    # Setze Standardsprache auf "de", falls keine Sprache angegeben ist
    if ($accept_language ~ "^$") {
        set $accept_language "${languages[0]}";
    }

    # Weiterleitung zu Standardsprache, wenn keine Sprache in der URL
    if ($uri !~ ^/(${languagesString})) {
        rewrite ^(.*)$ /$accept_language$1 permanent;
    }

    # Erlaubte Routen mit Sprachpräfix
    location ~ ^/(${languagesString})(/.*|$) {
        try_files $uri /$1/index.html?$args;
    }
}`;
}

function generateNginxConfig() {
    const httpConfig = generateHttp();

    return `events {}\n\n${httpConfig}`;
}

function generateDefaultConfig() {
    const serverConfig = generateServer();

    return `${serverConfig}`;
}

function writeNginxConfigToFile() {
    const nginxConfig = generateNginxConfig();
    const outputPath = path.resolve(__dirname, 'nginx.conf');
    fs.writeFileSync(outputPath, nginxConfig, 'utf8');
    console.log(`NGINX configuration written to ${outputPath}`);
}

function writeDefaultConfigToFile() {
    const nginxConfig = generateDefaultConfig();
    const outputPath = path.resolve(__dirname, 'default.conf');
    fs.writeFileSync(outputPath, nginxConfig, 'utf8');
    console.log(`NGINX configuration written to ${outputPath}`);
}

getLanguagesFromConfig();
writeNginxConfigToFile();
writeDefaultConfigToFile();
