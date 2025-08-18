require('dotenv').config();
const cheerio = require('cheerio');
const { Telegraf } = require('telegraf');

// === CONFIG ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SEARCH_URL = `https://www.kijiji.ca/b-cell-phone/saskatoon/${encodeURIComponent(process.env.KEYWORDS)}/k0c${process.env.CATEGORY_ID}l${process.env.LOCATION_ID}?sort=dateDesc`;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
let lastSeenId = null;

// === SCRAPER ===
async function fetchListings() {
    const res = await fetch(SEARCH_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const ads = [];
    $('a[data-testid="rich-card-link"]').each((_, element) => {
        const title = $(element).text().trim();
        const url = $(element).attr('href');

        ads.push({
            id: url.split('/').pop(),
            title,
            url: 'https://www.kijiji.ca' + url,
        });
    });



    return ads;
}

// === LOOP ===
let firstRun = true;

async function checkForNewListings() {
    try {
        const ads = await fetchListings();

        console.log("Scraped ads:", ads);

        if (firstRun) {
            if (ads.length > 1) {
                lastSeenId = ads[1].id;  // Initialize as second ad
                console.log(`Initialized lastSeenId as ${lastSeenId}`);
            }
            firstRun = false;
            return;
        }

        for (let i = 1; i < ads.length; i++) {
            const ad = ads[i];
            if (ad.id === lastSeenId) break;

            const message = `New Kijiji Listing!\n\n${ad.title}\n🔗${ad.url}`;

            await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message);
        }


        // After sending messages, update to the real newest (which is the second ad)
        if (ads.length > 1) {
            lastSeenId = ads[1].id;  // Always track the second ad as newest
        }

    } catch (err) {
        console.error("Error scraping Kijiji:", err.message);
    }
}



// === RANDOM INTERVAL ===
async function startLoop() {
    while (true) {
        await checkForNewListings();
        const delay = (240 + Math.random() * 180) * 1000;

        console.log(`Waiting ${(delay / 1000).toFixed(0)} seconds until next check...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

startLoop();