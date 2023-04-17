const fs = require('fs');
const path = require('path');

// Usage
// node encode-string.js myEncodedFile.txt

// Get the file path from the command line arguments
const filePath = process.argv[2];

function encodeStringFromFile(filePath) {
  // Read the file contents as a string
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  let data = JSON.parse(fileContent);

  data.context.timestamp = new Date().toISOString();
  data.data = JSON.stringify(data.data, null, null);
  
  let processedData = JSON.stringify(data, null, null);

  // Create a new file path for the decoded string
  const processedFilePath = path.join(path.dirname(filePath), `${path.basename(filePath)}.output.json`);

  fileContent = processedData.replaceAll("/", "\\/");
  fileContent = processedData.replaceAll('"', '\\"');
  fileContent = processedData.replaceAll('"', '\\"');

  // Write the decoded string to the new file
  fs.writeFileSync(processedFilePath, processedData, 'utf-8');

  // console.log(`Encoded string written to ${processedFilePath}`);
}

// Call the function with the provided file path
encodeStringFromFile(filePath);