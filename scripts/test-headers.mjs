import fetch from 'node-fetch';

async function test() {
  const url = "https://www.minimalistbeads.in/images-cdn/image/upload/w_800,q_auto,f_webp/minimalist-beads-v2/qgcthwzfsf1dh7m1df.jpg";
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log("Status:", res.status);
    if (res.ok) {
      console.log("Headers:");
      for (const [key, value] of res.headers.entries()) {
        if (['cache-control', 'x-vercel-cache', 'age', 'vary', 'content-length', 'cf-cache-status'].includes(key.toLowerCase())) {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
