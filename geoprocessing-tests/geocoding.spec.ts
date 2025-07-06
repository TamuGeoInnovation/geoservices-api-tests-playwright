import { test, expect } from "@playwright/test";
import { TestCategory } from "../interfaces/test-case.interface";
import { assertAttributeMatchers } from "../utils/attribute-matcher";
import { parse } from "csv-parse/sync";
import fs from "fs";


import dotenv from "dotenv";
var path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Load the test data once at module level
const categories: Array<TestCategory> = require("../data/geocoding-addresses-single-noDomains.json");

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

          //Get .csv file name and stabish a connection to the desired .csv file for the lost of Domains to test
          //NOTE: As of current version, the first Domain listed will be used as the base to be tested against.
          const domainsCSV = parse(fs.readFileSync(path.join(__dirname, "../data/Domain_test2.csv")),{
            //Insert desired .csv formatting parameters.
          });
          const domains = domainsCSV[0];
          const apiKey = process.env.API_KEY || "demo";
          var responses: number[] = [];
          for(const index in domains){
            
            // Append the API Key query param to the query URL. Pull this from your environment variables and default to 'demo' test key.
            // console.log(process.env);
            const fullQuery = domains[index]+testCase.query;
            //console.log(fullQuery);
            const queryWithApiKey = new URL(fullQuery);
            queryWithApiKey.searchParams.append("apikey", apiKey);

            // DEBUG:
            // Log the full query URL for debugging
            // console.log(`query URL: ${queryWithApiKey.toString()}`);

            // Make the geocoding API request
            const response = await page.request.get(queryWithApiKey.toString());

            // Test for 200 OK response. This doesn't guarantee the query is valid, but it's a good start.
            expect(response.ok()).toBeTruthy();

            // Because GSVCS API's don't conform exactly to any standard, the request might return a 200 OK status even if the query is invalid or returns no results.
            // So we check the status code explicitly
            const responseData = await response.json();
            
            // Basic validation - you can expand this based on your requirements
            expect(responseData).toBeDefined();

            // Add the response to a running array of all queries
            responses.push(responseData);
          }
          
          // Check if testCase has attributeMatchers. If none, skip the testing and assume truthy response.
          // If testCase does have matchers, loop through them and validate each one.
          var success: boolean[] = [];
          if (testCase.attributeMatchers && testCase.attributeMatchers.length > 0){   
            for (const index in responses){
              success.push(
                assertAttributeMatchers(
                  responses[0], //Set as the expectation for responses[index]
                  responses[index],
                  domains[index],
                  testCase.attributeMatchers
                )
              )
            }
          } else {
            console.log(
              "No attribute matchers defined for this test case, skipping validation."
            );
          }

          for(const index in success){
            expect(success[index]).toBeTruthy();
          }

          // Log test completion
          console.log(`Completed test: ${testCase.source}`);
        });
      });
    });
  });
});
