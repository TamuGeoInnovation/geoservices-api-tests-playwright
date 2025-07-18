import jp from "jsonpath";

/**
 * Utility functions for validating API responses against attribute matchers
 */

/**
 * Extracts a value from an object using a dot-notation path
 * @param obj - The object to extract the value from
 * @param path - JPath notation of object attribute (e.g., "$.data.results.[0].address")
 * @returns The value at the specified path, or undefined if not found
 */
export function extractValueFromPath(obj: any, path: string): any {
  const v = jp.value(obj, path);

  return v;
}

/**
 * Validates response data against an array of attribute matchers
 * @param responseData - The response data to validate
 * @param matchers - Array of attribute matchers to validate against
 * @returns Array of validation results with details about each matcher
 */
export function validateAttribute(
  responseDataExpectation: any,
  testedResponseData: any,
  location: string
): {
  location: string;
  expectedValue: any;
  testedValue: any;
  passed: boolean;
  error?: string;
} {
  try {
    const expectedValue = extractValueFromPath(responseDataExpectation, location);
    const testedValue = extractValueFromPath(testedResponseData, location);
    const passed = expectedValue === testedValue;

    return {
      location,
      expectedValue,
      testedValue,
      passed,
      error: passed ? undefined : `Expected ${expectedValue}, got ${testedValue}`,
    };
  } catch (error: any) {
    return {
      location,
      expectedValue: undefined,
      testedValue: undefined,
      passed: false,
      error: `Error extracting value: ${error.message}`,
    };
  }
}

/**
 * Validates response data against attribute matchers and throws assertion errors if any fail
 * @param responseData - The response data to validate
 * @param matchers - Array of attribute matchers to validate against
 * @param expectFunction - The expect function from the testing framework
 */
export function testAttribute(
  responseDataExpectation: any,
  testedResponseData: any,
  domain: string,
  location: string
): boolean {
  const result = validateAttribute(responseDataExpectation, testedResponseData, location);
  let ret = false;
  if (!result.passed) {
    console.error(`Subtest for ${domain} ${result.location} failed: ${result.error}`);
  } else {
    console.log(`Subtest for ${domain} ${result.location} passed: ${result.expectedValue}` );
    ret = true;
  }
  return ret;
}
