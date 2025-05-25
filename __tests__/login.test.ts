import puppeteer, { Browser, Page } from 'puppeteer';
import { BASE_URL } from "../constants";

describe('Login Form', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2' });
    });

    it('should display the login form and log in successfully', async () => {
        await page.type('[data-testid="email"]', 'testuser@example.com');
        await page.type('[data-testid="password"]', 'testpassword123');

        await page.click('[data-testid="submit"]');

        await page.waitForSelector('[data-testid="navbar-dashboard"]', { timeout: 5000 });

        const dashboardNav = await page.$('[data-testid="navbar-dashboard"]');
        expect(dashboardNav).not.toBeNull();
    });

    it('should show a toast saying "Login successful!" on login', async () => {
        await page.type('[data-testid="email"]', 'testuser@example.com');
        await page.type('[data-testid="password"]', 'testpassword123');

        await page.click('[data-testid="submit"]');

        await page.waitForSelector('.Toastify__toast--success', { timeout: 5000 });

        const toastText = await page.$eval('.Toastify__toast--success', el => el.textContent);
        expect(toastText).toContain('Login successful!');
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

    it('should show error toast on wrong email with correct password', async () => {
        await page.type('[data-testid="email"]', 'nonexistent@example.com');
        await page.type('[data-testid="password"]', 'testpassword123');

        await page.click('[data-testid="submit"]');

        await page.waitForSelector('.Toastify__toast--error', { timeout: 5000 });

        const toastText = await page.$eval('.Toastify__toast--error', el => el.textContent?.trim());
        expect(toastText).toContain('Login failed: Invalid email or password');
    });

    it('should show error toast on correct email with wrong password', async () => {
        await page.type('[data-testid="email"]', 'testuser@example.com');
        await page.type('[data-testid="password"]', 'wrongpassword');

        await page.click('[data-testid="submit"]');

        await page.waitForSelector('.Toastify__toast--error', { timeout: 5000 });

        const toastText = await page.$eval('.Toastify__toast--error', el => el.textContent?.trim());
        expect(toastText).toContain('Login failed: Invalid email or password');
    });

    it('should show "Too short!" below password when password is less than 6 characters', async () => {
        await page.type('[data-testid="email"]', 'testuser@example.com');
        await page.type('[data-testid="password"]', '123');

        await page.click('[data-testid="submit"]');

        const passwordError = await page.$eval('[data-testid="password"] ~ .text-red-500', el => el.textContent?.trim());
        expect(passwordError).toBe('Too short!');
    });

    it('should show "Invalid email" below email when email format is wrong', async () => {
        await page.type('[data-testid="email"]', 'invalid-email-address');
        await page.type('[data-testid="password"]', 'validpassword');

        await page.click('[data-testid="submit"]');

        const emailError = await page.$eval('[data-testid="email"] ~ .text-red-500', el => el.textContent?.trim());
        expect(emailError).toBe('Invalid email');
    });

    afterEach(async () => {
        await page.close();
    });

    afterAll(async () => {
        await browser.close();
    });
});
