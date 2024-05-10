const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const fs = require("fs");
const sharp = require("sharp");

class VideoScreenshotter {

  constructor(serviceAccountKeyPath, videoUrl) {
    this.serviceAccountKeyPath = serviceAccountKeyPath;
    this.videoUrl = videoUrl;
    this.bucket = null;
    this.browser = null;
    this.page = null;
    this.interval = null;
    this.screenshotCounter = 0;
  }

  async initializeFirebase() {
    const serviceAccount = require(this.serviceAccountKeyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "gs://enifira-d5f41.appspot.com",
    });
    this.bucket = admin.storage().bucket();
  }

  async launchBrowser() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  async takeScreenshots() {
    await this.page.goto(this.videoUrl);

    // Wait for the full screen button to load
    await this.page.waitForSelector(".ytp-fullscreen-button.ytp-button");
    await this.page.click(".ytp-fullscreen-button.ytp-button");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await this.page.evaluate(() => {
      const video = document.querySelector("video");
      video.currentTime = 133;
    });

    const videoDuration = await this.page.evaluate(() =>
      parseInt(document.querySelector("video").duration)
    );

    console.log(
      `duration is ${videoDuration} second. SS length ${parseInt(
        videoDuration / 2
      )} `
    );

    this.interval = setInterval(async () => {
      const screenshot = await this.page.screenshot();

      const image = sharp(screenshot);
      const metadata = await image.metadata();
      const width = metadata.width;
      const height = metadata.height;
      const cropSize = Math.min(width, height);

      const croppedImage = await image
        .extract({
          left: (width - cropSize) / 2,
          top: (height - cropSize) / 2,
          width: cropSize,
          height: cropSize,
        })
        .toBuffer();

      const hdImage = await sharp(croppedImage)
        .resize(1280, 720)
        .sharpen()
        .toFormat("webp")
        .toBuffer();

      const imagePath = `images/ss_${this.screenshotCounter}.webp`;
      fs.writeFileSync(imagePath, hdImage);

      this.bucket.upload(imagePath, {
        destination: "series/kv/e1/" + imagePath,
      });

      console.log(`current SS is ${this.screenshotCounter}`);
      this.screenshotCounter++;
    }, 2000);

    // until video length
    const videoLength = videoDuration * 1000;
    await new Promise((resolve) => setTimeout(resolve, videoLength));
  }

  async stop() {
    clearInterval(this.interval);
    await this.browser.close();
  }
}

(async () => {
  const serviceAccountKeyPath = "./serviceAccountKey.json";
  const videoUrl =
    "https://youtu.be/DkAHxvoA2Q8?list=PLpwZTEbwdv2eIG-TOnJngfybSoB4QZVp5";

  const videoScreenshotter = new VideoScreenshotter(
    serviceAccountKeyPath,
    videoUrl
  );
  await videoScreenshotter.initializeFirebase();
  await videoScreenshotter.launchBrowser();
  await videoScreenshotter.takeScreenshots();
  await videoScreenshotter.stop();
})();
