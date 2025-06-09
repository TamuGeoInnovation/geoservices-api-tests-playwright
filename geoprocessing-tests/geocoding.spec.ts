import { test, expect } from "@playwright/test";
import { TestCategory, TestCase } from "../data/test-case.interface";

// Load the test data once at module level
const categories: Array<TestCategory> = require("../data/geocoding-examples.json");

console.log(`Loaded ${categories.length} geocoding test categories`);

test.describe("Geocoding Tests", () => {
  // Dynamically create test suites for each category
  categories.forEach((category) => {
    test.describe(category.name, () => {
      test.beforeAll(() => {
        console.log(`Starting ${category.name} tests`);
      });

      // Create individual tests for each test case in the category
      category.tests.forEach((testCase, index) => {
        test(`${category.name} - Test ${index + 1}: ${testCase.source}`, async ({
          page,
        }) => {
          console.log(`Running test: ${testCase.source} (${testCase.vintage})`);

          // Make the geocoding API request
          const response = await page.request.get(testCase.query);
          expect(response.ok()).toBeTruthy();

          const responseData = await response.json();
          console.log(`Response status: ${response.status()}`);

          // Basic validation - you can expand this based on your requirements
          expect(responseData).toBeDefined();

          // Example validations (adjust based on your API response structure)
          if (responseData.results) {
            expect(responseData.results).toBeInstanceOf(Array);
            console.log(`Found ${responseData.results.length} results`);
          }

          // Log test completion
          console.log(`Completed test: ${testCase.source}`);
        });
      });
    });
  });

  // Keep your existing example test if needed for reference
  // test("playwright example test", async ({ page }) => {
  //   await page.goto("https://playwright.dev/");

  //   // Click the get started link.
  //   await page.getByRole("link", { name: "Get started" }).click();

  //   // Expects page to have a heading with the name of Installation.
  //   await expect(
  //     page.getByRole("heading", { name: "Installation" })
  //   ).toBeVisible();
  // });
});
