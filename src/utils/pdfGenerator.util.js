import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import handlebars from "handlebars";

export const generateStyledCertificate = async (user, course,instructorData) => {
  const templatePath = path.resolve("./src/templates/certificate.html");
  const html = fs.readFileSync(templatePath, "utf8");

  const template = handlebars.compile(html);
  const data = {
    name: user.name,
    course: course.title,
    instructor: instructorData.name,
    date: new Date().toLocaleDateString(),
  };
  const htmlContent = template(data);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // ✅ Ensure directory exists
  const outputDir = path.resolve("./certificates");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${user.name}_${Date.now()}.pdf`);
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return outputPath;
};
