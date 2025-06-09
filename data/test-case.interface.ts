export interface TestCategory {
  id: number;
  name: string;
  tests: TestCase[];
}

export interface TestCase {
  source: string;
  vintage: string;
  query: string;
  id?: number;
  name?: string;
  description?: string;
  input?: any; // Adjust type based on expected input structure
  expectedOutput?: any; // Adjust type based on expected output structure
}
