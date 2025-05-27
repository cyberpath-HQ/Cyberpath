/*
 * This script takes a screenshot of the Astro application running in development mode.
 * It uses Puppeteer to launch a headless browser, navigate to the Astro app, and take a screenshot.
 * The screenshot is then optimized using Sharp and saved as a WebP image.
 *
 * THIS SCRIPT MUST BE RUN FROM THE ROOT OF THE PROJECT USING `node scripts/screenshot.js`
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import sharp from "sharp";
import { promisify } from "util";

const readdir = promisify(fs.readdir);

const url = "http://localhost:4321/database/";

/**
 * Start the Astro development server and return the ChildProcess instance
 * @returns {Promise<ChildProcessWithoutNullStreams>}
 */
async function startServer() {
    // Start the Astro development server
    let devServer;
    try {
        devServer = spawn(
            "npm",
            [
                "run",
                "dev",
            ],
            {
                stdio:  "inherit",
                cwd: process.cwd(),
                shell: true
            },
        );
    }
    catch (e) {
        console.error(e.message)
        process.exit(1);
    }

    // Give the server a moment to start
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 second

    console.log("Development server started");
    return devServer;
}

/**
 * Initialize Puppeteer and return the browser and page instances
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
async function initPuppeteer() {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page    = await browser.newPage();

    // Set the viewport size to 1920x800 pixels
    await page.setViewport({ width: 1920, height: 800 });

    return { browser, page };
}

/**
 * Focus on the target page and wait for the data to load
 * @param page
 * @returns {Promise<void>}
 */
async function focusOnTarget(page) {
    // Navigate to the page
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.evaluate(() => {
        // Remove the termly banner (damned cookies)
        const termly = document.getElementById("termly-code-snippet-support");
        if (termly) {
            termly.remove();
        }

        // Scroll down by 130 pixels, we don't care about the header
        window.scrollBy(0, 130);
    });

    // Let React load the data and render them, wait for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));
}

/**
 * Get the target filename of the screenshot, based on the generated file name
 * @returns {Promise<string>}
 */
async function getTargetFilename() {
    const files = await readdir("./dist/assets");

    const target = files.filter(file =>
        file.startsWith("CyberPath-Database") && file.endsWith(".webp"),
    );

    if (target.length === 0) {
        throw new Error("No file found, cannot save the screenshot");
    }

    return target[0];
}

async function main() {
    // lazily compute the target filename
    const target_filename_promise = getTargetFilename();

    // start the process
    const astro_dev_server  = await startServer();
    const { page, browser } = await initPuppeteer();
    await focusOnTarget(page);

    // Take the screenshot
    const screenshotBuffer = await page.screenshot();

    // Close the browser
    await browser.close();

    // Define output path and filename
    const outputDir      = "./dist/assets";
    const outputFilename = await target_filename_promise;
    const outputFilePath = path.join(outputDir, outputFilename);

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const image             = sharp(screenshotBuffer);
    const { width, height } = await image.metadata();

    // Optimize the screenshot using Sharp and save it as WebP
    await image.extract({ left: 300, top: 0, width: width - 600, height })
        .webp({ quality: 80 }) // Adjust quality as needed
        .toFile(outputFilePath);

    console.log(`Screenshot saved to: ${ outputFilePath }`);

    // Kill the dev server
    const is_killed = astro_dev_server.kill("SIGKILL");
    if (is_killed) {
        console.log("Development server killed successfully");
    }
    else {
        console.error("Failed to kill development server");
        process.exit(1);
    }
}

main()
    .catch(console.error);