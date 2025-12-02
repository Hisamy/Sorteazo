import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function renderTemplate(templateName, data) {
    const filePath = path.join(__dirname, "..", "templates", `${templateName}.html`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Template not found: ${templateName}`);
    }

    let html = fs.readFileSync(filePath, "utf8");

    for (const [key, value] of Object.entries(data)) {
        html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    return html;
}
