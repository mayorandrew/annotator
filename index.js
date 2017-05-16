const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const AdmZip = require('adm-zip');
const moment = require('moment');
const opn = require('opn');

const config = require('./config.json');

const app = express();
const logger = log4js.getLogger();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

function listImagesets() {
    const folder = config.imagesetsFolder;
    const contents = fs.readdirSync(folder);
    return contents.filter((file) =>
        fs.lstatSync(path.join(folder, file)).isDirectory()
    ).sort();
}

function listImages(imageset) {
    const folder = path.join(config.imagesetsFolder, imageset);
    const contents = fs.readdirSync(folder);
    return contents.sort();
}

function getAnnotations(imageset, image) {
    const filename = image + '.json';
    const filePath = path.join(config.resultsFolder, imageset, filename);
    return fs.existsSync(filePath) && JSON.parse(fs.readFileSync(filePath).toString());
}

function saveAnnotations(imageset, image, data) {
    const filename = image + '.json';
    const resultFolder = path.join(config.resultsFolder, imageset);
    if (!fs.existsSync(resultFolder)) {
        fs.mkdirSync(resultFolder);
    }
    const filePath = path.join(config.resultsFolder, imageset, filename);
    fs.writeFileSync(filePath, JSON.stringify(data));
    return true;
}

function packageAnnotations(imageset, userId) {
    let zip = AdmZip();
    let images = listImages(imageset);
    let missingAnnotations = [];
    images.forEach((image) => {
        const filePath = path.join(config.imagesetsFolder, imageset, image);
        zip.addFile(image, fs.readFileSync(filePath));
        const resultName = image + '.json';
        const resultPath = path.join(config.resultsFolder, imageset, resultName);
        if (fs.existsSync(resultPath)) {
            zip.addFile(resultName, fs.readFileSync(resultPath));
        } else {
            missingAnnotations.push(image);
        }
    });
    const zipName = moment().format('YYYYMMDD_HHmmss_') + userId + '_' + imageset + '.zip';
    const zipPath = path.join(config.zipsFolder, zipName);
    zip.writeZip(zipPath);
    return { missingAnnotations, zipPath };
}

app.get('/api/sets/', (req, res) => {
    return res.json({
        data: listImagesets()
    });
});

app.get('/api/sets/:name', (req, res) => {
    return res.json({
        data: listImages(req.params.name)
    });
});

app.get('/api/sets/:name/:image', (req, res) => {
    return res.json({
        data: getAnnotations(req.params.name, req.params.image)
    });
});

app.post('/api/sets/:name/:image', (req, res) => {
    return res.json({
        data: saveAnnotations(req.params.name, req.params.image, req.body)
    });
});

app.post('/api/sets/:name', (req, res) => {
    return res.json({
        data: packageAnnotations(req.params.name, req.body.id)
    });
});

function index(req, res) {
    return res.sendFile('index.html', {root: './public'});
}

app.get('/annotate/:name/:page', index);

app.listen(config.port, () => {
    logger.info("Application is running");
    if (config.openUrlOnStart) {
        opn(`http://localhost:${config.port}/`);
    }
});
