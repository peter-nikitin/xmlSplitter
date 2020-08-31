const fs = require('fs')

const path = require('path');

const getFilesFromFolder = (folder) => {
  try {

    const arrayOfItems = [];
    const filesInFolder = fs.readdirSync(path.join(__dirname, `../${folder}`));

    filesInFolder.forEach((file) => {
      if (path.extname(file) === ".xml") {
        arrayOfItems.push(file)
      }
    })

    console.log(`В папке найдено ${arrayOfItems.length} файлов`);
    return arrayOfItems;
  } catch (error) {
    console.log(error);
  }
  return true;
}

module.exports = getFilesFromFolder;