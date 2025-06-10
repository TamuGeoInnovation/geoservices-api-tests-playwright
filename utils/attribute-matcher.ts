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
  return jp.value(obj, path);
}

/**
 * Validates response data against an array of attribute matchers
 * @param responseData - The response data to validate
 * @param matchers - Array of attribute matchers to validate against
 * @returns Array of validation results with details about each matcher
 */
export function validateAttributeMatchers(
  responseData: any,
  matchers: AttributeMatcher[]
): Array<{
  matcher: AttributeMatcher;
  value: any;
  passed: boolean;
  error?: string;
}> {
  return matchers.map((matcher) => {
    try {
      const value = extractValueFromPath(responseData, matcher.path);
      const passed = value === matcher.value;

      return {
        matcher,
        value,
        passed,
        error: passed ? undefined : `Expected ${matcher.value}, got ${value}`,
      };
    } catch (error) {
      return {
        matcher,
        value: undefined,
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
  responseData: any,
  matchers: AttributeMatcher[],
  expectFunction: (actual: any) => any
): void {
  const results = validateAttributeMatchers(responseData, matchers);

  results.forEach((result) => {
    if (!result.passed) {
      console.error(`Matcher ${result.matcher.name} failed: ${result.error}`);
    } else {
      console.log(`Matcher ${result.matcher.name} passed: ${result.value}`);
    }

    expectFunction(result.value).toEqual(result.matcher.value);
  });
}
