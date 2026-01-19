function copyTSR() {
  const fs = require("fs");
  const path = require("path");
  const tsr = path.resolve(__dirname, ".vercel/output/dist/client/__tsr");
  const dist = path.resolve(__dirname, ".vercel/output/static/__tsr");
  try {
    fs.cpSync(tsr, dist, { recursive: true });
    console.log("TSR copied successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

copyTSR();
