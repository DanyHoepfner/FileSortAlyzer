/* Importing modules from node */
import path from "path";
import fs from "fs";
import readline from "readline";

/* variables for configuration */
/* Path to the folder where the data is */
const dataFolder = "C:/Users/dany-/Desktop/FileSortAlyzer/Datensatz_unsortiert";
const destinationFolder = "C:/Users/dany-/Desktop/FileSortAlyzer/Datensatz";

const lineNumber = 1;

/* Function: Read in a file, create filestream, create interface, read the first line and return  */
async function getLine(filePath, lineNumber) {
  // Create a readable stream from the given file
  const fileStream = fs.createReadStream(filePath);
  // Create an interface for reading the file line by line
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // assign a varialble to measure the actual line
  // we go through the file line by line and return the desired line specified in the variable lineNumber
  let lineCounter = 0;

  try {
    if (lineNumber < 1) {
      throw new Error("Line Number must be at least 1");
    }
    for await (const line of rl) {
      lineCounter++;
      if (lineCounter === lineNumber) {
        rl.close();
        return line;
      }
    }

    if (lineCounter < lineNumber) {
      throw new Error("Line Number exceeds total number of lines in the file");
    }
  } catch (error) {
    rl.close();
    console.error("Error reading file: ", error);
  }
}

async function calculateStammNr(SpikaNummer) {
  if (SpikaNummer.length >= 6 && SpikaNummer.length <= 20) {
    if (SpikaNummer.length == 6) {
      return SpikaNummer;
    } else {
      return SpikaNummer.slice(0, 6);
    }
  } else {
    console.log(
      "Die Nr: " + SpikaNummer + " ist keine valide Baugruppennummer"
    );
    return;
  }
}

function createDirectoyIfNotExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
    console.log("Directory created");
  } else {
    console.log("Directory already exists");
  }
}

// testing
async function processFile(file, lineNumber) {
  try {
    const filePath = path.join(dataFolder, file);
    const firstLineBGNR = await getLine(filePath, lineNumber);
    console.log(firstLineBGNR);
    const stammNr = await calculateStammNr(firstLineBGNR);
    console.log(stammNr);

    // create folder and subfolder
    if (typeof stammNr !== "undefined") {
      const destinationFolderPath = path.join(destinationFolder, stammNr);

      createDirectoyIfNotExists(destinationFolderPath);

      const dirFilePath = path.join(destinationFolderPath, file);
      fs.renameSync(filePath, dirFilePath);
      console.log("verschoben");
    }
  } catch (error) {
    console.error(error);
  }
}

/* Function: Read the content of a folder */
async function readDirectory(pathToFolder) {
  fs.readdir(pathToFolder, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      const datFiles = files.filter((file) => file.endsWith(".dat"));
      console.log(datFiles);

      for (const file of datFiles) {
        processFile(file, lineNumber);
      }
    }
  });
}

async function processAllFiles() {
  readDirectory(dataFolder);
}

processAllFiles();
