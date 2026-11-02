# 🧪 Backdoor Intel Lab (External Prototyping & Testing Sandbox)

> **Status: 100% Detached From Production**  
> This directory is an external testing lab. It is **completely isolated** from the Backdoor Next.js production web app, production API routes, and Supabase production databases. Nothing in this directory is compiled or deployed to production.

---

## 🎯 Purpose

The purpose of this standalone sandbox is to test, benchmark, and iteratively improve the company research and interview intelligence models **externally** until the output quality is consultant-grade.

By testing externally:
1. **Zero Production Risk**: No experimental UI, unapproved tabs, or unstable routes enter the production build.
2. **Instant Feedback (0.1s)**: Run benchmarks and prompt evaluations directly in your terminal in under a second.
3. **Multi-Format Prototyping**: Test different output structures (1-page Battle Cards, Case Sparring, Raw Signal Extractions) before committing to any UX design.

---

## 🚀 Quick Start

Run the standalone CLI tool from the project root:

```bash
# 1. Generate an Executive Battle Card for Stripe
npm run intel:lab -- --company "Stripe" --role "Staff PM"

# 2. Test Case-Sparring format (Interview Trap Predictor)
npm run intel:lab -- --company "Figma" --role "Product Lead" --format case-sparring

# 3. Test Raw Signal extraction
npm run intel:lab -- --company "Linear" --role "Engineering Director" --format raw-signals

# 4. Save to a custom output path
npm run intel:lab -- --company "Datadog" --role "Product Manager" --out ./sandbox/datadog.md
```

The output markdown file is automatically written to [`sandbox/intel-lab-output.md`](./intel-lab-output.md) so you can review it immediately in your editor.

---

## 📁 Directory Structure

```
sandbox/intel-lab/
├── README.md               # This guide
├── intel-lab.ts            # Standalone CLI runner & benchmark script
├── engine/                 # Detached research & synthesis logic
│   ├── prompt-builder.ts
│   ├── role-classifier.ts
│   ├── financial-translator.ts
│   ├── swot-voc-synthesizer.ts
│   ├── review-scraper.ts
│   ├── rapidapi-connectors.ts
│   ├── gslides-exporter.ts
│   ├── gsheets-exporter.ts
│   └── gdocs-exporter.ts
├── types/                  # Isolated TypeScript definitions
├── tests/                  # Standalone test files for research algorithms
└── ui/                     # Archived experimental UI components (NOT imported in production)
```

---

## ⚙️ How to Iterate on Output Quality

1. Open [`sandbox/intel-lab/intel-lab.ts`](./intel-lab.ts).
2. Modify the prompt synthesis templates, diagnostic question algorithms, or metric formulas.
3. Re-run `npm run intel:lab -- --company "<TargetCompany>" --role "<TargetRole>"`.
4. Inspect [`sandbox/intel-lab-output.md`](./intel-lab-output.md) to judge the sharpness and relevance of the output.
5. Repeat until you are 100% satisfied with the quality. Only then will anything be wired into the main application.
