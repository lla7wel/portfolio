/* Lighthouse CI — mobile runs against the production build in dist/.
   Budgets follow the Measured Systems performance targets. */
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: [
        "http://localhost/en/index.html",
        "http://localhost/ar/index.html",
        "http://localhost/en/work/index.html",
        "http://localhost/en/work/nova-raid/index.html",
        "http://localhost/en/work/fpga-digital-logic/index.html",
        "http://localhost/en/contact/index.html",
      ],
      numberOfRuns: 1, // Lighthouse defaults to mobile emulation
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/reports" },
  },
};
