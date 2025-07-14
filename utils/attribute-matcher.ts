import jp from "jsonpath";

/**
 * Utility functions for validating API responses against attribute matchers
 */

export interface AttributeMatcher {
  name: string;
  path: string;
  value: any;
}

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
export function validateAttributeMatchers(
  responseData1: any,
  responseData2: any,
  location: any
): Array<{
  location: any;
  value1: any;
  value2: any;
  passed: boolean;
  error?: string;
}> {
  return location.map((matcher) => {
    try {
      const value1 = extractValueFromPath(responseData1, location);
      const value2 = extractValueFromPath(responseData2, location);
      const passed = value1 === value2;

      return {
        location,
        value1,
        value2,
        passed,
        error: passed ? undefined : `Expected ${value1}, got ${value2}`,
      };
    } catch (error) {
      return {
        location,
        value1: undefined,
        value2: undefined,
        passed: false,
        error: `Error extracting value: ${error.message}`,
      };
    }
  });
}

/**
 * Validates response data against attribute matchers and throws assertion errors if any fail
 * @param responseData - The response data to validate
 * @param matchers - Array of attribute matchers to validate against
 * @param expectFunction - The expect function from the testing framework
 */
export function assertAttributeMatchers(
  responseData1: any,
  responseData2: any,
  domain: any,
  location: any
): boolean {
  const results = validateAttributeMatchers(responseData1, responseData2, location);
  var ret = true;
  results.forEach((result) => {
    if (!result.passed) {
      console.error(`Subtest for ${domain} ${result.location} failed: ${result.error}`);
    } else {
      console.log(`Subtest for ${domain} ${result.location} passed: ${result.value1}` );
    }
    if (!(result.value1 === result.value2)){
      ret = false;
    }
  });
  return ret;
}
