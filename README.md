# Kijiji Car Scraper
Scrapes the newest car listings from Kijiji and sends a Telegram notification when a new listing is posted.
Each new listing is also saved automatically to a MySQL database

## How to Run the Application
1. **Create a Bot on Telegram using BotFather**
   - Open Telegram and search for `@BotFather`
   - Send `/start`
   - Send `/newbot`
   - Choose a name and a username (the username must end in **“bot”**, e.g., `kijijisniper_bot`)
   - You’ll receive a token that looks like this:  
     `123456789:ABCDefGhIjkLmNoPqRsTuVwXyZ`
   - Save this token — it’s how your scraper will communicate with Telegram.

2. **Get Your Telegram Chat ID**
   - Open Telegram and search for `@userinfobot`
   - Send `/start`
   - Take note of your chat ID — you’ll need it later.


3. **Set Up the Database (Aiven MySQL)**
   - Go to [https://aiven.io](https://aiven.io) and create a free MySQL service.  
   - Copy your connection details (host, port, username, password, and database name).  
   - Inside your database, create the following table:

     ```sql
     CREATE TABLE listings (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255),
       price VARCHAR(50)
     );
     ```

4.  **Create a `.env` File in the Project Folder**
     - Add the following lines:

     ```bash
     TELEGRAM_BOT_TOKEN=
     TELEGRAM_CHAT_ID=
     LOCATION_ID=
     CATEGORY_ID=174
     DB_HOST=
     DB_PORT=
     DB_USER=
     DB_PASSWORD=
     DB_NAME=
     ```

     - Add the bot token you received in Step 1 and the chat ID from Step 2.
     - Add the database credentials (host, port, username, password, and name) from Step 3.  
     - To find the location ID, open [https://www.kijiji.ca/](https://www.kijiji.ca/)
     - Set your location to the city you want to scrape listings from.
     - Press **“Buy & Sell”** and navigate to any category.
     - The URL will look something like this:  
     `https://www.kijiji.ca/b-bmx-bike/saskatoon/c645l1700197?address=Saskatoon%2C%20SK&ll=52.157902%2C-106.6701577&radius=50`
     - The location ID starts with **1700** and is seven digits long.  
     - In this example, the location ID is **1700197** (Saskatoon).
     - Add the location ID to the file.

5.  **Update the SEARCH_URL in Kijiji-bot.js**
     - Modify this line
  
      ```JavaScript
      const SEARCH_URL = `https://www.kijiji.ca/b-cars-trucks/CityName/c${process.env.CATEGORY_ID}l${process.env.LOCATION_ID}?for-sale-by=ownr&price=0__15000&sort=dateDesc&view=list`;
      ```
     - Replace CityName with your actual city.
     - For example, if you’re scraping listings in Saskatoon, it should look like this:
  
     ```JavaScript
     const SEARCH_URL = `https://www.kijiji.ca/b-cars-trucks/saskatoon/c${process.env.CATEGORY_ID}l${process.env.LOCATION_ID}?for-sale-by=ownr&price=0__15000&sort=dateDesc&view=list`;

6.  **Run the Application with Docker**
    - Make sure Docker is installed and running.
    - In the project folder, run:
       ```docker
       docker compose build
       ```
    - Once the build completes, run:
       ```docker
       docker compose up
       ```
**Note:**  
   - The scraper is currently set to fetch car listings priced between **$0 and $15,000**.  
   - You can easily adjust this range by changing the `price` parameter in the `SEARCH_URL`
 ```javascript
 const SEARCH_URL = `https://www.kijiji.ca/b-cars-trucks/saskatoon/c${process.env.CATEGORY_ID}l${process.env.LOCATION_ID}?for-sale-by=ownr&price=0__15000&sort=dateDesc&view=list`;
 ```
  - For example, to scrape listings between **$5,000 and $25,000**, modify it to:
 ```javascript
 price=5000__25000
 ```
##  Example Telegram Notification


Below is an example of what the bot message looks like on Telegram:

<p align="center">
  <img src="https://raw.githubusercontent.com/abdulrehman36/kijiji-car-sniper/main/assets/IMG_5917.jpg" alt="Telegram Notification Example" width="350"/>
</p>

## Example Database Entries

Each new listing is also stored in the MySQL database.  
Below is an example of what the `listings` table looks like:

<p align="center">
  <img src="https://raw.githubusercontent.com/abdulrehman36/Kijiji-IPhone-Scraper/main/assets/IMG_5914.jpg" alt="Telegram Notification Example" width="350"/>
</p>
