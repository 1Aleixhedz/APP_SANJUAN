// Utilidad de desarrollo: abre la app en Edge y guarda capturas de pantalla.
// Uso: node scripts/captura.mjs [ruta ...]
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const rutas = process.argv.slice(2);
const objetivos = rutas.length > 0 ? rutas : ["/"];

await mkdir("capturas", { recursive: true });

const navegador = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ["--no-sandbox"],
});

const pagina = await navegador.newPage();
await pagina.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

const errores = [];
pagina.on("console", (mensaje) => {
  if (mensaje.type() === "error") errores.push(mensaje.text());
});
pagina.on("pageerror", (error) => errores.push(String(error)));

for (const ruta of objetivos) {
  const url = `${BASE}${ruta}`;
  await pagina.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 700));
  const nombre = ruta === "/" ? "inicio" : ruta.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const destino = `capturas/${nombre}.png`;
  const selector = process.env.SELECTOR;
  if (selector) {
    const elemento = await pagina.$(selector);
    if (!elemento) throw new Error(`No existe el selector ${selector}`);
    await elemento.screenshot({ path: destino });
  } else {
    await pagina.screenshot({ path: destino, fullPage: true });
  }
  console.log(`${url} -> ${destino}`);
}

if (errores.length > 0) {
  console.log("\nErrores en consola:");
  for (const error of new Set(errores)) console.log(` - ${error}`);
}

await navegador.close();
