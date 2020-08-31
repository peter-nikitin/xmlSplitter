const Client = require('ftp');
const path = require('path');
const fs = require('fs')
const async = require('async');


const FTP_STATUSES = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED,"
}

class FtpController {
  constructor() {
    this.host = process.env.FTP_HOST;
    this.user = process.env.FTP_USER;
    this.password = process.env.FTP_PASS;
    this.ftpClient = new Client();
    this.init();
    this.ftpStatus = FTP_STATUSES.NOT_CONNECTED;
    this.filesInFolder = [];
    this.downloadedFiles = 0;
    this.targetLocalFolder = "";
  }

  init() {
    this.ftpClient.on('ready', () => {
      this.ftpStatus = FTP_STATUSES.CONNECTED;
    });

    this.ftpClient.connect({
      host: this.host,
      user: this.user,
      password: this.password,
    });
  }

  destroy() {
    this.ftpClient.on('end', () => {
      this.ftpStatus = FTP_STATUSES.NOT_CONNECTED;
    })
    this.ftpClient.destroy();
  }

  getFilesInFolder(targetFtpPath) {
    this.targetFileOnFtp = targetFtpPath;
    return new Promise((resolve, rejects) => {
      this.ftpClient.list(targetFtpPath, false, (err, list) => {
        if (err) rejects(err);
        list.forEach((item) => {
          if (path.extname(item.name) === ".xml") {
            this.filesInFolder.push(item);
          }
        });
        resolve(this.filesInFolder);
      })
    });
  }

  downloadFile(targetFile, targetPath, collback) {
    if (!fs.existsSync(path.join(__dirname, `../${targetPath}`))) {
      fs.mkdirSync(path.join(__dirname, `../${targetPath}`));
    }

    this.ftpClient.get(`${this.targetFileOnFtp}/${targetFile}`, (err, stream) => {
      stream.once('close', () => { this.ftpClient.end(); });
      stream.pipe(fs.createWriteStream(`${targetPath}/${targetFile}`));
      stream.on('end', () => {
        this.downloadedFiles += 1;
        console.log(`done ${targetFile}`)
        collback();
      })
    });
  }

  uploadFile(file, pathOnFTP, collback) {
    console.log(pathOnFTP);
    this.ftpClient.append(file, pathOnFTP, (err) => {
      if (err) throw err;
      this.ftpClient.end();
      collback();
    });
  }

  downloadAllFilesFromFolder(targetLocalFolder) {
    if (this.targetLocalFolder === "") {
      this.targetLocalFolder = targetLocalFolder;
    }
    return async.mapSeries(this.filesInFolder, (item, collback) => this.downloadFile(item.name, this.targetLocalFolder, collback))
  }

  uploadAllFilesFromLocalFolder(filesInFolder, pathOnFTP) {
    return async.mapSeries(
      filesInFolder,
      (item, collback) => {
        console.log(item);
        return (
          this.uploadFile(item, pathOnFTP, collback)
        )
      })
  }
}



module.exports = FtpController;