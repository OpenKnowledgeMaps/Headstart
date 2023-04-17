const fs = require('fs');
const path = require('path');

// Usage
// node decode-string.js myEncodedFile.txt

// Get the file path from the command line arguments
const filePath = process.argv[2];

function decodeStringFromFile(filePath) {
  // Read the file contents as a string
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  // console.log(fileContent.substring(500, 650));

  // fileContent = fileContent.replaceAll("\\\\/", "/");
  // fileContent = fileContent.replaceAll("\\\"", '"');
  // fileContent = fileContent.replaceAll("\\\"", '"');

  // console.log(fileContent.substring(500, 650));

  fileContent = JSON.parse(fileContent);
  fileContent.data = JSON.parse(fileContent.data);

  // Create a new file path for the decoded string
  const processedFilePath = path.join(path.dirname(filePath), `${path.basename(filePath)}.simple.json`);

  // Write the decoded string to the new file
  fs.writeFileSync(processedFilePath, JSON.stringify(fileContent, null, 2), 'utf-8');

  console.log(`Decoded string written to ${processedFilePath}`);
}

// Call the function with the provided file path
decodeStringFromFile(filePath);