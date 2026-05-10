import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # show the browser window
        
        # Make it look like a real browser
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
            locale="en-NZ",
        )
        page = await context.new_page()

        # Step 3 - navigate to the milk category
        await page.goto("https://www.woolworths.co.nz/shop/browse/fridge-deli/milk", 
                       wait_until="domcontentloaded")
        
        # Step 4 - wait for products to load
        await page.wait_for_selector(".cupPrice", timeout=15000)

        # Step 5 - find all product titles
        titles = await page.query_selector_all("h3[id$='-title']")

        # Step 6 - find all product prices
        prices = await page.query_selector_all(".cupPrice")

        # Step 7 - pair them up and print each one
        for title, price in zip(titles, prices):
            name = await title.inner_text()
            cost = await price.inner_text()
            print(f"{name} → {cost}")

        # Step 8 - close the browser
        await browser.close()

asyncio.run(main())