const major = parseInt(process.version.slice(1).split('.')[0], 10);
if (major < 18 || major > 21) {
  console.error(`Unsupported Node.js version ${process.version}.\nPlease use Node.js 18–21.`);
  process.exit(1);
}

