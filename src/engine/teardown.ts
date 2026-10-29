export interface ProductTeardown {
  company: string;
  threePillars: string[];
}

export function generateTeardown(company: string): ProductTeardown {
  return {
    company,
    threePillars: ["Growth Loops", "Retention Drivers", "Monetization Architecture"],
  };
}
