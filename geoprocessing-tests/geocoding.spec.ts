import { test, expect } from "@playwright/test";
import { TestCategory } from "../data/test-case.interface";
import { assertAttributeMatchers } from "../utils/attribute-matcher";

import dotenv from "dotenv";
var path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

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

          // Append the API Key query param to the query URL. Pull this from your environment variables and default to 'demo' test key.
          console.log(process.env);
          const apiKey = process.env.API_KEY || "demo";
          const queryWithApiKey = new URL(testCase.query);
          queryWithApiKey.searchParams.append("apikey", apiKey);

          // DEBUG:
          // Log the full query URL for debugging
          console.log(`Query URL: ${queryWithApiKey.toString()}`);

          // Make the geocoding API request
          const response = await page.request.get(queryWithApiKey.toString());

          // Test for 200 OK response. This doesn't guarantee the query is valid, but it's a good start.
          expect(response.ok()).toBeTruthy();

          // Because GSVCS API's don't conform exactly to any standard, the request might return a 200 OK status even if the query is invalid or returns no results.
          // So we check the status code explicitly
          const responseData = await response.json();

          // DEBUG:
          // Log response for debudebugging;
          console.log(responseData);

          expect(responseData.statusCode).toBe(200);

          // Basic validation - you can expand this based on your requirements
          expect(responseData).toBeDefined();

          // Check if testCase has attributeMatchers. If none, skip the testing and assume truthy response.
          // If testCase does have matchers, loop through them and validate each one.
          if (
            testCase.attributeMatchers &&
            testCase.attributeMatchers.length > 0
          ) {
            assertAttributeMatchers(
              responseData,
              testCase.attributeMatchers,
              expect
            );
          } else {
            console.log(
              "No attribute matchers defined for this test case, skipping validation."
            );
          }

          // Example validations (adjust based on your API response structure)
          if (responseData.data.results) {
            expect(responseData.data.results).toBeInstanceOf(Array);
            console.log(`Found ${responseData.data.results.length} results`);
          }

          // Log test completion
          console.log(`Completed test: ${testCase.source}`);
        });
      });
    });
  });
});
