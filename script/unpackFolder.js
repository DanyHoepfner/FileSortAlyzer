/* unpack the folders and save the files into on common folder, make no duplicates exist */
// for d3 it's better to use a flat dataset and grouping the data

const fs = require("fs").promises;
const path = require("path");

// Function to move files to the destination folder
async function moveFilesToDestination(sourceDir, destinationDir) {
  // Ensure the destination directory exists
  await fs.mkdir(destinationDir, { recursive: true });

  // Stack to hold directories that need to be processed
  const dirsToProcess = [sourceDir];

  while (dirsToProcess.length > 0) {
    const currentDir = dirsToProcess.pop();

    try {
      // Read the contents of the current directory
      const files = await fs.readdir(currentDir);

      for (let file of files) {
        const sourcePath = path.join(currentDir, file);
        const destPath = path.join(destinationDir, file);

        const stats = await fs.stat(sourcePath);

        if (stats.isDirectory()) {
          // Add subdirectories to the stack
          dirsToProcess.push(sourcePath);
        } else {
          // Move the file to the destination directory
          await fs.rename(sourcePath, destPath);
          console.log(`Moved: ${sourcePath} → ${destPath}`);
        }
      }

      // Optionally, remove the directory if it's empty after moving files
      const remainingFiles = await fs.readdir(currentDir);
      if (remainingFiles.length === 0) {
        await fs.rmdir(currentDir);
        console.log(`Removed empty directory: ${currentDir}`);
      }
    } catch (err) {
      console.error("Error processing directory:", err);
    }
  }
}

// Example usage
const sourceDir = "C:/Users/dany-/Desktop/FileSortAlyzer/Datensatz"; // The directory you want to unpack
const destinationDir =
  "C:/Users/dany-/Desktop/FileSortAlyzer/Datensatz_unsortiert"; // The folder where files should go

moveFilesToDestination(sourceDir, destinationDir);
