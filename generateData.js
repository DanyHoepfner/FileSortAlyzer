/* This Script interates over all datafiles, reads data and saves the
    Data in a Json file format. Each Json Object represents one datafile */

import path from "path";
import { promises as fsPromises } from "fs";
import fs from "fs";
import readline from "readline";

let dataSetTestFolder = [];

// This folder contains all Data (sorted)

const dataFolderPath = "C:/Users/dany-/Desktop/SpikaDaten/Datensatz";
// this is the path to where the output file should go
const pathJSON = "./output.json";

async function readFolder(dataFolderPath) {
  try {
    const files = await fsPromises.readdir(dataFolderPath);
    const directories = files.filter((file) => {
      return fs.statSync(path.join(dataFolderPath, file)).isDirectory();
    });

    for await (const dir of directories) {
      // dir represents one folder inside my whole datafolder directories
      const spikaFolder = path.join(dataFolderPath, dir);
      const subFiles = await fsPromises.readdir(spikaFolder);

      // datafiles represent the datafiles inside one subfolder
      const dataFiles = subFiles.filter((subFile) => subFile.endsWith(".dat"));

      for await (const dataFile of dataFiles) {
        const filePath = path.join(spikaFolder, dataFile);
        await readFileAndGenerateData(filePath);
      }
      console.log(dataSetTestFolder);
      // Assuming dataSetTestFolder is your array
      const jsonData = JSON.stringify(dataSetTestFolder, null, 2);

      // To save the JSON data to a file
      fs.writeFile(pathJSON, jsonData, (err) => {
        if (err) {
          console.error("Error writing to file", err);
        } else {
          console.log("JSON data saved to output.json");
        }
      });
    }
  } catch (error) {
    console.error("Error reading direcory: ", error);
  }
}

async function readFileAndGenerateData(fileName) {
  const fileStream = fs.createReadStream(fileName);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let counter = 0;
  let dataPoint = {};

  try {
    for await (const line of rl) {
      counter++;

      if (counter === 1) {
        dataPoint["stammNummer"] = line.slice(0, 6);
      }
      if (counter === 6) {
        dataPoint["date"] = line;
      }

      if (counter === 8) {
        dataPoint["time"] = line;
      }
    }
    dataSetTestFolder.push(dataPoint);
    rl.close();
  } catch (error) {
    rl.close();
    console.error(error);
  }
}

readFolder(dataFolderPath);
