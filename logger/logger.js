const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

// Java uygulamasını çalıştır
function runJavaApp(params) {
    return new Promise((resolve, reject) => {
        exec(`java -jar C:\\Users\\Administrator\\Desktop\\test\\tss-client-console-3.1.19.jar ${params}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error during Java App execution:', error);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Google Drive'a yeni klasör oluştur
async function createFolder(service, folderName) {
    var fileMetadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    try {
        let res = await service.files.create({
            resource: fileMetadata,
            fields: 'id'
        });
        console.log('Folder created with ID: ', res.data.id);
        // Klasörü belirli bir kullanıcıyla paylaş
        let permissions = {
            'type': 'user',
            'role': 'reader',
            'emailAddress': 'eimzaeguven@gmail.com'
        };
        await service.permissions.create({
            resource: permissions,
            fileId: res.data.id,
            fields: 'id',
        });
        console.log('Folder shared with user: ', 'eimzaeguven@gmail.com');
        return res.data.id;
    } catch (error) {
        console.error('Error during folder creation:', error);
    }
}

// Google Drive'a dosya yükle
async function uploadFile(service, fileName, destinationFileName, folderId) {
    var fileMetadata = {
        'name': destinationFileName,
        'parents': [folderId]
    };
    var media = {
        mimeType: 'text/plain', // Dosyanın MIME tipini belirtin
        body: fs.createReadStream(fileName)
    };
    try {
        let res = await service.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        console.log('File Id: ', res.data.id);
    } catch (error) {
        console.error('Error during file upload:', error);
    }
}

// Ana işlem
async function main() {
    try {
        // Parametreleri belirle
        const file = 'zd.txt';
        const url = 'http://tzd.kamusm.gov.tr';
        const port = '80';
        const customerNo = '11726';
        const customerPassword = '4EmiL5aK';

        console.log('Starting Java App execution...');
        // Java uygulamasını çalıştır ve çıktıyı al
        const output = await runJavaApp(`-z ${file} ${url} ${port} ${customerNo} ${customerPassword}`);
        console.log('Java App execution completed.');

        console.log('Starting file upload to Google Drive...');
        // Google Drive'a dosyaları yükle
        const auth = new GoogleAuth({
            keyFile: 'C:\\Users\\Administrator\\Desktop\\test\\double-lore-393811-417087e6e3d9.json',
            scopes: 'https://www.googleapis.com/auth/drive',
        });
        const service = google.drive({version: 'v3', auth: await auth.getClient()});

        const timestamp = new Date().toISOString();
        console.log('Creating folder on Google Drive...');
        const folderId = await createFolder(service, timestamp);

        console.log('Uploading files to Google Drive...');
        await uploadFile(service, file, file, folderId);
        await uploadFile(service, file + '.zd', file + '.zd', folderId);
        console.log('File upload completed.');
    } catch (error) {
        console.error('Error during main function execution:', error);
    }
}

console.log('Scheduling cron job...');
// Her gün saat 00:00'de ana işlemi çalıştır
cron.schedule('0 0 * * *', main);
console.log('Cron job scheduled.');

// Test için main fonksiyonunu hemen çağır
main();
