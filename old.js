// const admin = require("firebase-admin");

// const serviceAccount = require("./serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "gs://enifira-d5f41.appspot.com",
// });

// const bucket = admin.storage().bucket();

// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const sharp = require("sharp");

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto(
//     "https://youtu.be/DkAHxvoA2Q8?list=PLpwZTEbwdv2eIG-TOnJngfybSoB4QZVp5"
//   );

//   // Videoyu tam ekran yapmak için gerekli elementin seçicisini bul
//   const fullScreenButtonSelector = ".ytp-fullscreen-button.ytp-button";

//   // Tam ekran butonu yüklenene kadar bekleyin
//   await page.waitForSelector(fullScreenButtonSelector);

//   // Tam ekran butonuna tıkla
//   await page.click(fullScreenButtonSelector);

//   // 5 saniye bekle
//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   // Videoyu 2:13'ten başlatmak için JavaScript kodunu çalıştır
//   await page.evaluate(() => {
//     const video = document.querySelector("video");
//     video.currentTime = 133; // İstenen başlangıç zamanı (saniye cinsinden)
//   });

//   // Video uzunluğunu al
//   const videoDuration = await page.evaluate(
//     () => document.querySelector("video").duration
//   );
//   console.log("Video Uzunluğu:", videoDuration);

//   // Ekran görüntüsü alma işlemi
//   let screenshotCounter = 0;
//   const interval = setInterval(async () => {
//     const screenshot = await page.screenshot();

//     // Köşelerdeki siyah alanları kırp
//     const image = sharp(screenshot);
//     const metadata = await image.metadata();
//     const width = metadata.width;
//     const height = metadata.height;
//     const cropSize = Math.min(width, height); // Köşelerdeki siyah alanların boyutu

//     const croppedImage = await image
//       .extract({
//         left: (width - cropSize) / 2,
//         top: (height - cropSize) / 2,
//         width: cropSize,
//         height: cropSize,
//       })
//       .toBuffer();

//     // Görüntüyü HD hale getir ve daha netleştir
//     const hdImage = await sharp(croppedImage)
//       .resize(1280, 720)
//       .sharpen()
//       .toFormat("webp")
//       .toBuffer();

//     // Görüntüyü dosyaya yaz

//     const imagePath = `images/ss_${screenshotCounter}.webp`;
//     fs.writeFileSync(imagePath, hdImage);
//     bucket.upload(imagePath, {
//       destination: "series/kv/e1/" + imagePath,
//     });

//     screenshotCounter++;
//   }, 2000); // Her saniye

//   // Videonun uzunluğuna kadar beklet
//   const videoLength = videoDuration * 1000;
//   await new Promise((resolve) => setTimeout(resolve, videoLength));

//   // Otomasyonu durdur
//   clearInterval(interval);
//   await browser.close();
// })();

