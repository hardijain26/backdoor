/**
 * Role & Product-Line Scoping Engine
 * Subsystem: @intel/teardown (M5)
 * Task: SCR-T01
 */

import { RoleArchetype, ARCHETYPE_PROFILES } from '@/types/archetypes';

/**
 * Classifies a job title and description into one of 11 functional archetypes.
 */
export function classifyArchetype(roleTitle: string, description?: string): RoleArchetype {
  const t = roleTitle.toLowerCase();
  const desc = (description || '').toLowerCase();

  // 1. Product Management
  if (/\b(product manager|pm|gpm|cpo|product lead|head of product|director of product|vp of product|technical product manager|tpm)\b/i.test(t)) {
    return 'PRODUCT_MANAGEMENT';
  }

  // 2. Product Design / UX
  if (/\b(ux|ui|designer|design lead|product design|user experience|user researcher|design systems)\b/i.test(t)) {
    return 'PRODUCT_DESIGN';
  }

  // 3. Engineering & Tech
  if (/\b(software|engineer|developer|devops|sre|backend|frontend|fullstack|data engineer|systems engineer|architect|engineering manager|cto|vp of engineering)\b/i.test(t)) {
    return 'ENGINEERING_TECH';
  }

  // 4. Finance & Accounting
  if (/\b(finance|financial|fp&a|fpa|accounting|accountant|controller|treasury|cfo|chief financial officer|audit|pricing analyst)\b/i.test(t)) {
    return 'FINANCE_ACCOUNTING';
  }

  // 5. Founder's Office & Chief of Staff
  if (/\b(founder|chief of staff|cos|special projects|executive associate)\b/i.test(t)) {
    return 'FOUNDER_OFFICE';
  }

  // 6. Corporate Strategy & BizOps
  if (/\b(strategy|corporate strategy|bizops|business operations|corp dev|corporate development|strategic planning|cso)\b/i.test(t)) {
    return 'CORPORATE_STRATEGY_BIZOPS';
  }

  // 7. Sales & Commercial GTM
  if (/\b(sales|account executive|ae|sdr|bdr|revenue|cro|commercial|enterprise sales|inside sales)\b/i.test(t)) {
    return 'SALES_GTM';
  }

  // 8. Marketing & Growth
  if (/\b(marketing|growth|seo|sem|content|brand|demand gen|cmo|performance marketing|product marketing|pmm)\b/i.test(t)) {
    return 'MARKETING_GROWTH';
  }

  // 9. Customer Success & Support Operations
  if (/\b(customer success|csm|client success|support ops|customer operations|implementation specialist|account manager)\b/i.test(t)) {
    return 'OPERATIONS_CS';
  }

  // 10. Legal & Compliance
  if (/\b(legal|counsel|compliance|regulatory|privacy|general counsel|attorney|data protection)\b/i.test(t)) {
    return 'LEGAL_COMPLIANCE';
  }

  // 11. People & Talent
  if (/\b(recruiter|talent|people|hr|hrbp|human resources|people ops|talent acquisition)\b/i.test(t)) {
    return 'PEOPLE_TALENT';
  }

  // Fallback heuristic: check description keywords if title was ambiguous
  if (desc) {
    if (/\b(product roadmap|user stories|backlog|feature prioritization|ttv)\b/i.test(desc)) {
      return 'PRODUCT_MANAGEMENT';
    }
    if (/\b(wireframes|figma|prototyping|heuristic evaluation)\b/i.test(desc)) {
      return 'PRODUCT_DESIGN';
    }
    if (/\b(ci\/cd|microservices|distributed systems|kubernetes|sql|python|typescript)\b/i.test(desc)) {
      return 'ENGINEERING_TECH';
    }
    if (/\b(ebitda|gross margin|budgeting|financial modeling|p&l)\b/i.test(desc)) {
      return 'FINANCE_ACCOUNTING';
    }
    if (/\b(tam|market expansion|build vs buy|m&a)\b/i.test(desc)) {
      return 'CORPORATE_STRATEGY_BIZOPS';
    }
  }

  return 'CORPORATE_STRATEGY_BIZOPS';
}

/**
 * Extracts a specific product division or sub-entity from JD title and description
 * to eliminate parent-company generic noise.
 * Examples:
 *  - "Staff Product Manager - Uber Freight" at "Uber" -> "Uber Freight"
 *  - "Senior PM, AWS Bedrock" at "Amazon" -> "AWS Bedrock"
 *  - "Product Manager, Service Hub" at "HubSpot" -> "HubSpot Service Hub"
 *  - "Product Manager" at "Stripe" -> "Stripe"
 */
export function extractScopedProduct(companyName: string, roleTitle: string, description?: string): string {
  const cleanCompany = (companyName || '').trim();
  if (!cleanCompany) return roleTitle.trim();

  // 1. Look for delimited product line in the title (e.g. "Title - Division", "Title, Product", "Title (Product)")
  const delimiterPatterns = [
    /[-–—|:,]\s*([A-Za-z0-9\s&+/]+)$/i,
    /\(([^)]+)\)$/i,
    /\b(?:for|on|lead for|pm for)\s+([A-Za-z0-9\s&+/]+)$/i,
  ];

  for (const pattern of delimiterPatterns) {
    const match = roleTitle.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ensure candidate isn't just location or level (e.g., "Remote", "US", "L6", "Senior")
      if (!/^(remote|hybrid|onsite|us|usa|emea|apac|india|europe|london|sf|new york|l[0-9]|level [0-9]|full[- ]time)$/i.test(candidate)) {
        if (candidate.length >= 3) {
          // If the candidate entity already mentions the company name, return it
          if (candidate.toLowerCase().includes(cleanCompany.toLowerCase())) {
            return candidate;
          }
          // If the candidate does not contain company name, prepend company name for clarity
          return `${cleanCompany} ${candidate}`;
        }
      }
    }
  }

  // 2. Check description for explicit division / product callouts
  if (description) {
    const descMatch = description.match(/(?:division|product line|business unit|team|group):\s*([A-Za-z0-9\s&]+)/i);
    if (descMatch && descMatch[1]) {
      const unit = descMatch[1].trim();
      if (unit.length >= 3 && unit.length <= 40) {
        if (unit.toLowerCase().includes(cleanCompany.toLowerCase())) {
          return unit;
        }
        return `${cleanCompany} ${unit}`;
      }
    }
  }

  // 3. Fallback: default to company name
  return cleanCompany;
}

/**
 * Generates scoped review and sentiment search queries targeting the specific product entity.
 */
export function buildScopedReviewQueries(companyName: string, scopedProduct?: string) {
  const targetEntity = (scopedProduct && scopedProduct.trim().length > 0) ? scopedProduct.trim() : companyName.trim();
  const sanitized = targetEntity.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    targetEntity,
    sanitizedSlug: sanitized,
    reddit: `site:reddit.com "${targetEntity}" ("complaint" OR "bug" OR "broken" OR "issue" OR "frustration")`,
    getApp: `site:getapp.com/p/${sanitized} "cons" OR "disadvantages"`,
    capterra: `site:capterra.com/p/${sanitized} "cons" OR "difficult" OR "missing"`,
    g2: `site:g2.com/products/${sanitized}/reviews "what do you dislike"`,
    trustpilot: `site:trustpilot.com/review/${sanitized} "stars 1" OR "stars 2"`,
    pissedConsumer: `site:pissedconsumer.com "${targetEntity}" ("complaint" OR "refund" OR "terrible")`,
    appStoreRss: `https://itunes.apple.com/us/rss/customerreviews/id=${sanitized}/json`,
  };
}
