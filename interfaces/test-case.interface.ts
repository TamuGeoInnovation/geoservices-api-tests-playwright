export interface TestCategory {
  id: number;
  name: string;
  tests: TestCase[];
}

export interface TestCase {
  source: string;
  vintage: string;
  query: string;
  queryk8: string;
  id?: number;
  name?: string;
  description?: string;
  input?: any; // Adjust type based on expected input structure
  expectedOutput?: any; // Adjust type based on expected output structure

  /**
   * Optional matchers for attributes in the response.
   * This can be used to validate specific attributes in the response.
   * Each matcher specifies a name, the path to the attribute in the response,
   * and the expected value.
   */
  attributeMatchers?: Array<{
    name: string;
    path: string;
    value: any;
  }>;
}
