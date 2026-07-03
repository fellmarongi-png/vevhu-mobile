import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");
const PORT = 3333;

// 1. Simple static server
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === "/" ? "index.html" : req.url.split("?")[0]);
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        fs.readFile(path.join(DIST_DIR, "index.html"), (err, html) => {
          if (err) {
            res.writeHead(500);
            res.end("Error loading index.html");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html, "utf-8");
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, async () => {
  console.log(`[Verify] Static web server listening on http://localhost:${PORT}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 412, height: 915 } }); // Pixel 7 viewport
    const page = await context.newPage();

    const consoleLogs = [];
    const consoleErrors = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    page.on("pageerror", (exception) => {
      consoleErrors.push(`[Uncaught Exception] ${exception.stack || exception}`);
    });

    console.log(`[Verify] Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle", timeout: 15000 });

    console.log("[Verify] Waiting for React UI to mount and checkAuth redirect...");
    await page.waitForTimeout(3000);

    // Take screenshot
    const screenshotPath = path.resolve(__dirname, "../dist/verified-login-screen.png");
    await page.screenshot({ path: screenshotPath });
    console.log(`[Verify] Screenshot saved to: ${screenshotPath}`);

    // Check DOM contents
    const bodyText = await page.innerText("body");
    console.log("\n[Verify] Rendered Text on Page:");
    console.log("-----------------------------------------");
    console.log(bodyText.trim() || "(Empty text)");
    console.log("-----------------------------------------");

    if (bodyText.includes("VEVHU") && bodyText.includes("Field Worker")) {
      console.log("✅ SUCCESS: Login UI rendered cleanly with VEVHU logo and Field Worker title!");
    } else {
      console.log("⚠️ WARNING: Could not find VEVHU text on page.");
    }

    if (consoleErrors.length > 0) {
      console.log("\n[Verify] Console Errors encountered:");
      consoleErrors.forEach((err) => console.log("  ❌", err));
    } else {
      console.log("\n✅ ZERO Console Errors on app boot!");
    }
  } catch (err) {
    console.error("[Verify] Test execution error:", err);
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(0);
  }
});
