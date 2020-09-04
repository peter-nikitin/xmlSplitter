const Client = require('ftp');
const path = require('path');
const fs = require('fs')
const async = require('async');


const FTP_STATUSES = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED,"
}

class FtpController {
  constructor(settings) {
    this.host = process.env.FTP_HOST;
    this.user = process.env.FTP_USER;
    this.password = process.env.FTP_PASS;
    this.ftpClient = new Client();
    this.init();
    this.ftpStatus = FTP_STATUSES.NOT_CONNECTED;
    this.filesInFolder = [];
    this.downloadedFiles = 0;
    this.targetLocalFolder = "";
    this.settings = settings;
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
          this.filesInFolder.push(item.name);
          // if (path.extname(item.name) === ".xml" || path.extname(item.name) === ".gz") {
          //   this.filesInFolder.push(iconv.decode(item.name, "win1251"));
          // }
        });
        resolve(this.filesInFolder);
      })
    });
  }

  downloadFile(pathOnFTP, targetFile, targetPath, collback) {
    this.targetFolderOnFTP = pathOnFTP;

    if (!fs.existsSync(path.join(__dirname, `../${targetPath}`))) {
      fs.mkdirSync(path.join(__dirname, `../${targetPath}`));
    }

    console.log(`${this.targetFolderOnFTP}/${targetFile}`);

    this.ftpClient.get(`/${this.targetFolderOnFTP}/${targetFile}`, (err, stream) => {
      if (err) console.log(err);
      stream.pipe(fs.createWriteStream(`${targetPath}/${targetFile}`));
      // stream.pipe(path.extname(targetFile) === ".gz" ? unzipper.Extract({ path: `${targetPath}/${targetFile}` }) : fs.createWriteStream(`${targetPath}/${targetFile}`));


      stream.on('end', () => {
        this.downloadedFiles += 1;
        console.log(`done ${targetFile}`)
        collback();
      })
    });
  }

  downloadAllFilesFromFolder(targetLocalFolder) {
    if (this.targetLocalFolder === "") {
      this.targetLocalFolder = targetLocalFolder;
    }
    return async.mapSeries(this.filesInFolder,
      (item, collback) => this.downloadFile(item, this.targetLocalFolder, collback))
  }

  checkFolder(folder, targetPath) {
    const foldersOnFtp = [];
    return new Promise((resolve, reject) => {
      this.ftpClient.list(targetPath, false, (err, list) => {
        if (err) reject(err);
        list.forEach((item) => {
          if (item.type === "d") {
            foldersOnFtp.push(item.name);
          }
        })
        resolve(foldersOnFtp.includes(folder));
      })
    })
  }

  makeFolder(folderName) {
    this.ftpClient.mkdir(folderName, (err) => {
      if (err) throw err;
    })
  }

  uploadAllFilesFromLocalFolder(filesInFolder, pathOnFTP) {
    return async.mapSeries(
      filesInFolder,
      (item, collback) => {
        return (
          this.uploadFile(path.join(__dirname, `/${this.settings.OUTPUT_FOLDER_NAME}/${item}`), `${pathOnFTP}/${item}`, collback)
        )
      })
  }

  uploadFile(file, pathOnFTP, collback) {
    return new Promise((resolve, reject) => {
      this.ftpClient.append(file, pathOnFTP, (err) => {
        if (err) reject(err);
        resolve(collback());
      });
    })
  }

  uploadChunck(file, pathOnFTP) {
    console.log(`Start uploading file: ${pathOnFTP}`);
    return new Promise((resolve, reject) => {
      this.ftpClient.append(file, pathOnFTP, (err) => {
        if (err) reject(err);
        resolve(() => console.log(`Done file: ${pathOnFTP}`));
      });
    })
  }
}



module.exports = FtpController;