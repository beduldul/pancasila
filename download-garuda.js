const https = require('https');
const fs = require('fs');
const options = {
  hostname: 'upload.wikimedia.org',
  path: '/wikipedia/commons/1/1f/Garuda_Pancasila%2C_Coat_Arms_of_Indonesia.svg',
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
};
https.get(options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed: ${res.statusCode}`);
    return;
  }
  const file = fs.createWriteStream("frontend/public/garuda.svg");
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Downloaded the Garuda SVG.");
  });
}).on('error', (err) => {
  console.error("Error: ", err.message);
});
