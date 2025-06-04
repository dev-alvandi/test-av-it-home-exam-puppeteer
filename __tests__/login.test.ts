import puppeteer, { Browser, Page } from 'puppeteer';
import { BASE_URL } from "../constants";

describe('Login Form', () => {
    let browser: Browser;
    let page: Page;

    const login = async (email: string, password: string) => {
        await page.type('[data-testid="email"]', email);
        await page.type('[data-testid="password"]', password);
        await page.click('[data-testid="submit"]');
    };

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: true, // headless or GUI
            // slowMo: 30,
            // args: ['--window-size=1720,1440'],
        });
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.setViewport({
            width: 1720,
            height: 1440
        });
        await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2' });
    });

    it('should display the dashboard route in the navbar upon successful login', async () => {
        await login('testuser@example.com', 'testpassword123');

        await page.waitForSelector('[data-testid="navbar-dashboard"]', { timeout: 5000 });

        const dashboardNav = await page.$('[data-testid="navbar-dashboard"]');
        expect(dashboardNav).not.toBeNull();
    });

    it('should show a toast saying "Login successful!" on login', async () => {
        await login('testuser@example.com', 'testpassword123');

        await page.waitForSelector('.Toastify__toast--success', { timeout: 5000 });

        const toastText = await page.$eval('.Toastify__toast--success', el => el.textContent);
        expect(toastText).toContain('Login successful!');
    });

    it('should show error toast on wrong email with correct password', async () => {
        await login('nonexistent@example.com', 'testpassword123');

        await page.waitForSelector('.Toastify__toast--error', { timeout: 5000 });

        const toastText = await page.$eval('.Toastify__toast--error', el => el.textContent?.trim());
        expect(toastText).toContain('Login failed: Invalid email or password');
    });

    it('should show error toast on correct email with wrong password', async () => {
        await login('testuser@example.com', 'wrongpassword');

        await page.waitForSelector('.Toastify__toast--error', { timeout: 5000 });

        const toastText = await page.$eval('.Toastify__toast--error', el => el.textContent?.trim());
        expect(toastText).toContain('Login failed: Invalid email or password');
    });

    it('should show "Required" below email when email is empty', async () => {
        await page.type('[data-testid="password"]', 'testpassword123');

        await page.click('[data-testid="submit"]');

        const emailError = await page.$eval('[data-testid="email"] ~ .text-red-500', el => el.textContent?.trim());
        expect(emailError).toBe('Required');
    });

    it('should show "Required" below password when password is empty', async () => {
        await page.type('[data-testid="email"]', 'testuser@example.com');

        await page.click('[data-testid="submit"]');

        const passwordError = await page.$eval('[data-testid="password"] ~ .text-red-500', el => el.textContent?.trim());
        expect(passwordError).toBe('Required');
    });



    it('should show "Too short!" below password when password is less than 6 characters', async () => {
        await login('testuser@example.com', '123');

        const passwordError = await page.$eval('[data-testid="password"] ~ .text-red-500', el => el.textContent?.trim());
        expect(passwordError).toBe('Too short!');
    });

    it('should show "Invalid email" below email when email format is wrong', async () => {
        await login('invalid-email-address', 'validpassword');

        const emailError = await page.$eval('[data-testid="email"] ~ .text-red-500', el => el.textContent?.trim());
        expect(emailError).toBe('Invalid email');
    });

    afterEach(async () => {
        const logoutButton = await page.$('[data-testid="navbar-logout"]');
        if (logoutButton) {
            await logoutButton.click();
        }
        await page.close();
    });

    afterAll(async () => {
        await browser.close();
    });
});
