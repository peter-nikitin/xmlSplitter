const fs = require('fs')

const path = require('path');

const getFilesFromFolder = (folder) => {
  const arrayOfItems = [];
  const filesInFolder = fs.readdirSync(path.join(__dirname, folder));

  filesInFolder.forEach((file) => {
    if (path.extname(file) === ".xml") {
      arrayOfItems.push(file)
    }
  })


  console.log(`Get ${filesInFolder.length} files& Start spliting`);
  return arrayOfItems;
}

module.exports = getFilesFromFolder;