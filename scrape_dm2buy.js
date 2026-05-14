const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1080 });
  
  console.log("Navigating to store...");
  await page.goto('https://minimalistbeadsraw.dm2buy.com/', { waitUntil: 'networkidle2' });
  
  let previousHeight = 0;
  let noChangeCount = 0;
  let allProducts = [];
  let seenImages = new Set();
  
  console.log("Scrolling and collecting products...");
  
  while (noChangeCount < 5) {
    // Extract products currently in DOM
    const productsInView = await page.evaluate(() => {
      const items = [];
      const images = document.querySelectorAll('img');
      for (const img of images) {
        if (img.src && !img.src.includes('logo') && !img.src.includes('avatar')) {
          let container = img.parentElement;
          for (let i=0; i<4; i++) {
              if (!container) break;
              const text = container.innerText;
              if (text && (text.includes('₹') || /\d/.test(text))) {
                  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                  if (lines.length >= 2) {
                      let price = null;
                      let name = null;
                      for (const line of lines) {
                          if (line.includes('₹') || /^\d+$/.test(line)) price = line.replace(/[^0-9]/g, '');
                          else if (!name) name = line;
                      }
                      if (name && price) {
                          items.push({ name, price: parseInt(price), image: img.src });
                          break;
                      }
                  }
              }
              container = container.parentElement;
          }
        }
      }
      return items;
    });
    
    // Add to allProducts if new
    for (const p of productsInView) {
      if (!seenImages.has(p.image)) {
        seenImages.add(p.image);
        allProducts.push(p);
      }
    }
    
    const currentHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await new Promise(r => setTimeout(r, 2000));
    
    const newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) {
      noChangeCount++;
    } else {
      noChangeCount = 0;
      previousHeight = newHeight;
    }
    console.log(`Scrolled. Current height: ${newHeight}. Total products collected: ${allProducts.length}`);
  }
  
  console.log(`Total products extracted: ${allProducts.length}`);
  
  fs.writeFileSync('C:\\Users\\adity\\.gemini\\antigravity\\brain\\63a06749-c5c4-43ae-83b0-aa32a4e739c7\\scratch\\dm2buy_all_products.json', JSON.stringify(allProducts, null, 2));
  
  let csv = 'Name,Price,Image\n';
  allProducts.forEach(p => {
    csv += `"${p.name.replace(/"/g, '""')}",${p.price},"${p.image}"\n`;
  });
  fs.writeFileSync('d:\\OneDrive\\Desktop\\Minimalist Beads\\public\\products_export.csv', csv);
  
  console.log("Saved JSON and CSV!");
  await browser.close();
}

scrape().catch(console.error);
