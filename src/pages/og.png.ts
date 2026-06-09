import { html } from 'satori-html';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import yaml from 'js-yaml';

// Ова линија каже Astro-у да ову слику генерише само једном приликом билда
export const prerender = true;

export async function GET() {
  try {
    // 1. Учитавање података из config.yml
    const configFile = await fs.readFile('./src/data/config.yml', 'utf8');
    const data = yaml.load(configFile) as any;
    
    // Вучемо податке из конфигурације
    const imena = data.hero?.imena || "Миљан & Анђела";
    const datum = data.datum || "Ускоро";
    
    // Налазимо главни догађај
    const glavniDogadjaj = data.plan?.lokacije?.find((l: any) => l.naziv.includes('ручак') || l.naziv.includes('Сватов')) || data.plan?.lokacije[2];
    const vreme = glavniDogadjaj?.vreme || "16:00";
    const lokacija = glavniDogadjaj?.opis || "Вила Рајчић, Драгобраћа";

    // 2. Учитавамо твоју позадинску слику и претварамо је у Base64
    const bgBuffer = await fs.readFile('./public/images/hero-bg.jpg');
    const bgBase64 = `data:image/jpeg;base64,${bgBuffer.toString('base64')}`;

    // 3. Учитавамо фонт директно са интернета
    const fontBuffer = await fetch('https://unpkg.com/@fontsource/playfair-display@5.0.8/files/playfair-display-cyrillic-400-normal.woff').then(res => res.arrayBuffer());

    // 4. Дизајн OG слике помоћу HTML-а
    const markup = html`
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-image: url('${bgBase64}'); background-size: cover; background-position: center; font-family: 'Playfair', serif;">
        
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: rgba(67, 74, 66, 0.7); align-items: center; justify-content: center; color: #f4f1ea;">
          
          <p style="font-size: 35px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 20px; color: #b58d68;">Венчање</p>
          
          <h1 style="font-size: 110px; margin: 0; text-shadow: 0 5px 15px rgba(0,0,0,0.5);">${imena}</h1>
          
          <div style="display: flex; width: 200px; height: 4px; background-color: #b58d68; margin: 40px 0;"></div>
          
          <p style="font-size: 50px; margin: 0; font-weight: bold;">${datum}</p>
          
          <p style="font-size: 35px; margin-top: 20px; color: #f4f1ea; opacity: 0.9;">${vreme} | ${lokacija}</p>
        
        </div>
      </div>
    `;

    // 5. Генерисање SVG-а преко Satori-ја
    const svg = await satori(markup, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Playfair',
          data: fontBuffer,
          weight: 400,
          style: 'normal',
        }
      ],
    });

    // 6. Конверзија SVG-а у PNG преко Sharp-а (ово решава грешку!)
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    // Враћамо генерисану слику
    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error("Грешка приликом генерисања OG слике:", error);
    return new Response('Грешка', { status: 500 });
  }
}