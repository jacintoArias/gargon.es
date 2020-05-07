var paths = {};

// Source directory
paths.src = './src';
paths.app = './app';

// Config
paths.configFileProd = `${paths.src}/_config.yml`;
paths.configFileDev = `${paths.src}/localhost_config.yml`;

// App files locations
paths.appSassFiles = `${paths.app}/sass/app/**/*.scss`;
paths.appSassEntry = `${paths.app}/sass/app/**/main.scss`;
paths.appSassVendorFiles = `${paths.app}/sass/vendor/**/*.scss`;
paths.appSassVendorEntry = `${paths.app}/sass/vendor/**/main.scss`;
paths.appScriptFiles = `${paths.app}/js/**/*.js`;
paths.appScriptEntry = `${paths.app}/js/main.js`;
paths.appImages = `${paths.app}/assets/*.{jpg,png}`;

// Jekyll files locations
paths.jekyllData = `${paths.src}/_data/`;
paths.jekyllAssets = `${paths.src}/assets/`;

module.exports = paths;
