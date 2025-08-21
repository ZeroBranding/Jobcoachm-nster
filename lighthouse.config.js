// Lighthouse CI Konfiguration für JobCoach Münster
// Performance, Accessibility, SEO und Best Practices

module.exports = {
  ci: {
    collect: {
      // URLs zum Testen
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/leichte-sprache.html'
      ],
      
      // Lighthouse-Optionen
      settings: {
        chromeFlags: '--no-sandbox --headless',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      
      // Anzahl der Durchläufe pro URL
      numberOfRuns: 3
    },
    
    assert: {
      // Performance-Budgets
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Accessibility
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'tabindex': 'error',
        'heading-order': 'error',
        
        // SEO
        'categories:seo': ['error', { minScore: 0.95 }],
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'canonical': 'error',
        
        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'error'
      }
    },
    
    upload: {
      // Lighthouse CI Server (optional)
      target: 'temporary-public-storage',
      
      // GitHub Status Check
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      
      // Basic Auth für private Instanz
      basicAuth: {
        username: process.env.LHCI_BASIC_AUTH_USERNAME,
        password: process.env.LHCI_BASIC_AUTH_PASSWORD
      }
    },
    
    server: {
      // Lokaler LHCI Server (optional)
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lighthouse-ci.db'
      }
    }
  },
  
  // Erweiterte Konfiguration
  extends: 'lighthouse:default',
  
  settings: {
    // Audit-spezifische Einstellungen
    skipAudits: [
      // Diese Audits überspringen (falls nicht relevant)
      'unused-javascript',      // Für kleine Sites oft nicht relevant
      'unused-css-rules'        // CSS-Framework kann false positives erzeugen
    ],
    
    // Throttling für konsistente Ergebnisse
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    
    // Screen Emulation
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    
    // Form Factor
    formFactor: 'desktop',
    
    // User Agent
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Chrome-Lighthouse'
  },
  
  // Custom Audits (optional)
  audits: [
    // Accessibility-spezifische Custom Audits
    'accessibility/custom-focus-indicators',
    'accessibility/custom-skip-links',
    'accessibility/custom-aria-usage'
  ],
  
  // Categories-Gewichtung anpassen
  categories: {
    performance: {
      title: 'Performance',
      auditRefs: [
        { id: 'first-contentful-paint', weight: 10 },
        { id: 'largest-contentful-paint', weight: 25 },
        { id: 'cumulative-layout-shift', weight: 25 },
        { id: 'total-blocking-time', weight: 30 },
        { id: 'speed-index', weight: 10 }
      ]
    },
    accessibility: {
      title: 'Accessibility',
      description: 'WCAG 2.2 AA Compliance für JobCoach Münster'
    }
  }
};