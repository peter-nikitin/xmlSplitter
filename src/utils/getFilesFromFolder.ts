import fs from "fs";

import path from "path";

const getFilesFromFolder = (folder: string) => {
  try {
    const arrayOfItems: string[] = [];
    const filesInFolder = fs.readdirSync(path.join(__dirname, `../${folder}`));

    filesInFolder.forEach((file) => {
      if (path.extname(file) === ".xml") {
        arrayOfItems.push(file);
      }
    });

    console.log(`В папке найдено ${arrayOfItems.length} файлов`);
    return arrayOfItems;
  } catch (error) {
    console.log(error);
  }
  return true;
};

export default getFilesFromFolder;
