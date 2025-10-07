require('dotenv').config();
const cheerio = require('cheerio');
const { Telegraf } = require('telegraf');
const db = require('./db');

// === CONFIG ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SEARCH_URL = `https://www.kijiji.ca/b-cars-trucks/saskatoon/c${process.env.CATEGORY_ID}l${process.env.LOCATION_ID}?for-sale-by=ownr&price=0__15000&sort=dateDesc&view=list`;


const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
let lastSeenId = null;


async function fetchListings() {
    const res = await fetch(SEARCH_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const ads = [];

    // Only get ads from the real search results (skip spotlight/top-listings)
    $('ul[data-testid="srp-search-list"] section[data-testid="listing-card"]').each((_, element) => {
        const parent = $(element);

        const title = parent.find('[data-testid="listing-title"]').text().trim();
        const url = parent.find('a[data-testid="listing-link"]').attr('href');
        const price = parent.find('[data-testid="autos-listing-price-container"]').text().trim();

        ads.push({
            id: parent.attr('data-listingid'),
            title,
            price,
            url: url.startsWith('http') ? url : 'https://www.kijiji.ca' + url,
        });
    });

    return ads;
}
function saveListing(listing) {
    const { title, price } = listing;
    const sql = 'INSERT INTO listings (title, price) VALUES (?, ?)';
    db.query(sql, [title, price], err => {
        if (err) console.error('DB insert error:', err.message);
    });
}


// === LOOP ===
let firstRun = true;

async function checkForNewListings() {
    try {
        const ads = await fetchListings();

        console.log("Scraped ads:", ads);

        if (firstRun) {
            if (ads.length > 0) {
                lastSeenId = ads[0].id;  // Initialize as second ad
                console.log(`Initialized lastSeenId as ${lastSeenId}`);
            }
            firstRun = false; 
            return;
        }

        for (let i = 0; i < ads.length; i++) {
            const ad = ads[i];
            if (ad.id === lastSeenId) break;

            const message = `New Car Listing!\n\n'Item:' ${ad.title}\n'Price:' ${ad.price}\n🔗${ad.url}`;

            await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message);
            saveListing(ad);
        }


        // After sending messages, update to the real newest 
        if (ads.length > 0) {
            lastSeenId = ads[0].id;  // Always track the first ad as newest
        }

    } catch (err) {
        console.error("Error scraping Kijiji:", err.message);
    }
}



// === RANDOM INTERVAL LOOP (1–4 minutes) ===
async function startLoop() {
    while (true) {
        await checkForNewListings();
        const delay = Math.floor(Math.random() * (4 - 1 + 1) * 60 * 1000) + (1 * 60 * 1000);

        console.log(`Waiting ${(delay / 1000).toFixed(0)} seconds until next check...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

startLoop();
