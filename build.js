const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Look for the directory containing vite and package.json
const candidates = [
  path.join(__dirname, "SetuX", "frontend", "setux-frontend"),
  path.join(__dirname, "setux-frontend"),
  __dirname
];

let targetDir = null;
for (const dir of candidates) {
  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.name === "setux-frontend") {
      targetDir = dir;
      break;
    }
  }
}

if (!targetDir) {
  console.error("Could not find setux-frontend directory!");
  process.exit(1);
}

console.log("==> Building SetuX Frontend in:", targetDir);
execSync("npm install", { cwd: targetDir, stdio: "inherit" });
execSync("npm run build", { cwd: targetDir, stdio: "inherit" });

// If we are at repo root or SetuX/frontend, ensure dist is copied or accessible at ./dist
const distSource = path.join(targetDir, "dist");
const localDist = path.join(__dirname, "dist");

if (distSource !== localDist && fs.existsSync(distSource)) {
  fs.cpSync(distSource, localDist, { recursive: true, force: true });
  console.log("==> Copied dist output to:", localDist);
}

console.log("==> Build finished successfully! 🎉");
