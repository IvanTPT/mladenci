import { html } from 'satori-html';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import yaml from 'js-yaml';

export const prerender = true;

export async function GET() {
  try {
    const configFile = await fs.readFile('./src/data/config.yml', 'utf8');
    const data = yaml.load(configFile) as any;
    
    // 1. Основни подаци
    const imenaRaw = data.hero?.imena || data.imena || "Анђела и Миљан";
    let [ime1, ime2] = imenaRaw.split(/&| и /i).map((s: string) => s.trim());
    if (!ime2) {
      ime1 = "Анђела";
      ime2 = "Миљан";
    }
    
    let datum = data.hero?.datum || data.osnovno?.datum || data.datum || "09. Август 2026.";
    if (datum instanceof Date) {
      datum = datum.toLocaleDateString('sr-RS');
    }
    
    const glavniDogadjaj = data.vencanje?.lokacija || data.plan?.lokacije?.find((l: any) => l.naziv.includes('ручак') || l.naziv.includes('Сватов')) || data.plan?.lokacije[2];
    const vreme = glavniDogadjaj?.vreme || "16:00";
    
    // Брисање евентуалног "С -" које се поткрало у називу локације
    let lokacija = glavniDogadjaj?.opis || "Вила Рајчић, Драгобраћа";
    lokacija = lokacija.replace(/^С\s*-\s*/, ''); 

    let poruka_potvrde = data.interakcija?.poruka_potvrde || "Молимо Вас да потврдите долазак попуњавањем форме на позивници онлајн.";

    // 2. КОНТРОЛЕ СЛИКЕ (Читамо из config.yml)
    const bgPosition = data.og_image?.pozicija_slike || "center center";
    const overlayOpacity = data.og_image?.prozirnost_papira !== undefined ? data.og_image.prozirnost_papira : 0.80;

    // Учитавање позадинске слике у Base64
    const bgBuffer = await fs.readFile('./public/images/og_image_bg.jpg');
    const bgBase64 = `data:image/jpeg;base64,${bgBuffer.toString('base64')}`;

    // 3. Учитавање фонтова
    const [playfairCyr, playfairLat, marckCyr, marckLat] = await Promise.all([
      fetch('https://unpkg.com/@fontsource/playfair-display@5.0.8/files/playfair-display-cyrillic-400-normal.woff').then(res => res.arrayBuffer()),
      fetch('https://unpkg.com/@fontsource/playfair-display@5.0.8/files/playfair-display-latin-400-normal.woff').then(res => res.arrayBuffer()),
      fetch('https://unpkg.com/@fontsource/marck-script@5.0.8/files/marck-script-cyrillic-400-normal.woff').then(res => res.arrayBuffer()),
      fetch('https://unpkg.com/@fontsource/marck-script@5.0.8/files/marck-script-latin-400-normal.woff').then(res => res.arrayBuffer())
    ]);

    // 4. Дизајн са примењеним динамичким контролама
    const markup = html`
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-image: url('${bgBase64}'); background-size: cover; background-position: ${bgPosition}; font-family: 'PlayfairCyr', 'PlayfairLat', serif; box-sizing: border-box;">
        
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: rgba(244, 240, 230, ${overlayOpacity}); color: #4a453d; padding: 40px; box-sizing: border-box;">
          
          <div style="display: flex; flex-direction: column; width: 100%; height: 100%; border: 2px solid #bba585; position: relative; align-items: center; justify-content: center; padding: 40px; box-sizing: border-box;">
            
            <svg style="position: absolute; top: 20px; left: 20px;" width="70" height="70" viewBox="0 0 100 100">
              <path d="M10,90 L10,10 L90,10" fill="none" stroke="#bba585" stroke-width="3" />
              <path d="M25,75 L25,25 L75,25" fill="none" stroke="#bba585" stroke-width="1" />
              <circle cx="10" cy="10" r="5" fill="#bba585" />
            </svg>
            <svg style="position: absolute; top: 20px; right: 20px; transform: rotate(90deg);" width="70" height="70" viewBox="0 0 100 100">
              <path d="M10,90 L10,10 L90,10" fill="none" stroke="#bba585" stroke-width="3" />
              <path d="M25,75 L25,25 L75,25" fill="none" stroke="#bba585" stroke-width="1" />
              <circle cx="10" cy="10" r="5" fill="#bba585" />
            </svg>
            <svg style="position: absolute; bottom: 20px; left: 20px; transform: rotate(270deg);" width="70" height="70" viewBox="0 0 100 100">
              <path d="M10,90 L10,10 L90,10" fill="none" stroke="#bba585" stroke-width="3" />
              <path d="M25,75 L25,25 L75,25" fill="none" stroke="#bba585" stroke-width="1" />
              <circle cx="10" cy="10" r="5" fill="#bba585" />
            </svg>
            <svg style="position: absolute; bottom: 20px; right: 20px; transform: rotate(180deg);" width="70" height="70" viewBox="0 0 100 100">
              <path d="M10,90 L10,10 L90,10" fill="none" stroke="#bba585" stroke-width="3" />
              <path d="M25,75 L25,25 L75,25" fill="none" stroke="#bba585" stroke-width="1" />
              <circle cx="10" cy="10" r="5" fill="#bba585" />
            </svg>

            <p style="font-size: 24px; letter-spacing: 0.15em; margin: 0; text-transform: uppercase;">Позивамо вас на наше</p>
            <p style="font-size: 36px; letter-spacing: 0.25em; margin-top: 15px; margin-bottom: 60px; text-transform: uppercase;">Венчање</p>

            <h1 style="font-family: 'MarckCyr', 'MarckLat', cursive; font-size: 140px; margin: 0; font-weight: normal; line-height: 0.8;">${ime1}</h1>
            <span style="font-family: 'MarckCyr', 'MarckLat', cursive; font-size: 100px; margin: 15px 0;">и</span>
            <h1 style="font-family: 'MarckCyr', 'MarckLat', cursive; font-size: 140px; margin: 0; font-weight: normal; line-height: 0.8;">${ime2}</h1>

            <div style="display: flex; align-items: center; justify-content: center; margin-top: 80px;">
              <span style="font-size: 32px; letter-spacing: 0.1em; text-transform: uppercase;">Датум</span>
              
              <div style="display: flex; width: 2px; height: 70px; background-color: #bba585; margin: 0 40px;"></div>
              
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 46px; font-weight: bold; margin: 0; line-height: 1;">${datum.split(' ')[0]}</span>
                <span style="font-size: 28px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 5px;">${datum.split(' ').slice(1).join(' ')}</span>
              </div>

              <div style="display: flex; width: 2px; height: 70px; background-color: #bba585; margin: 0 40px;"></div>
              
              <span style="font-size: 38px; letter-spacing: 0.1em;">${vreme}h</span>

            </div>


            <p style="font-size: 28px; margin-top: 70px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: bold;">Локација</p>
            <p style="font-size: 26px; margin-top: 15px; opacity: 0.9;">${lokacija}</p>
            <p style="font-size: 20px; margin-top: 50px; opacity: 0.9;">${poruka_potvrde}</p>
          </div>
        </div>
      </div>
    `;

    const svg = await satori(markup, {
      width: 900,
      height: 1157, 
      fonts: [
        { name: 'PlayfairLat', data: playfairLat, weight: 400, style: 'normal' },
        { name: 'PlayfairCyr', data: playfairCyr, weight: 400, style: 'normal' },
        { name: 'MarckLat', data: marckLat, weight: 400, style: 'normal' },
        { name: 'MarckCyr', data: marckCyr, weight: 400, style: 'normal' }
      ],
    });

    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

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