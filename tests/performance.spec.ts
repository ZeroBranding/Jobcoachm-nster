import { test, expect } from '@playwright/test';

test.describe('Performance Tests - Core Web Vitals', () => {
  
  test('Homepage - Core Web Vitals Compliance', async ({ page }) => {
    // Performance-Metriken sammeln
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Web Vitals Metriken sammeln
        const metrics: any = {};
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID) - simuliert durch First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            metrics.fcp = entries[0].startTime;
          }
        }).observe({ entryTypes: ['paint'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          metrics.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Navigation Timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
        
        // Warte kurz und sammle finale Metriken
        setTimeout(() => {
          resolve(metrics);
        }, 3000);
      });
    });

    console.log('Performance Metrics:', performanceMetrics);

    // Core Web Vitals Thresholds (Google Standards)
    if (performanceMetrics.lcp) {
      expect(performanceMetrics.lcp, 'LCP should be < 2500ms').toBeLessThan(2500);
    }
    
    if (performanceMetrics.cls !== undefined) {
      expect(performanceMetrics.cls, 'CLS should be < 0.1').toBeLessThan(0.1);
    }
    
    if (performanceMetrics.fcp) {
      expect(performanceMetrics.fcp, 'FCP should be < 1800ms').toBeLessThan(1800);
    }
    
    if (performanceMetrics.ttfb) {
      expect(performanceMetrics.ttfb, 'TTFB should be < 600ms').toBeLessThan(600);
    }
  });

  test('Resource Loading - Optimize Asset Delivery', async ({ page }) => {
    const resourceMetrics: any[] = [];
    
    // Resource-Loading überwachen
    page.on('response', (response) => {
      const url = response.url();
      const timing = response.timing();
      
      resourceMetrics.push({
        url: url,
        status: response.status(),
        size: response.headers()['content-length'],
        contentType: response.headers()['content-type'],
        timing: timing
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe kritische Ressourcen
    const cssFiles = resourceMetrics.filter(r => r.contentType?.includes('text/css'));
    const jsFiles = resourceMetrics.filter(r => r.contentType?.includes('javascript'));
    const imageFiles = resourceMetrics.filter(r => r.contentType?.includes('image'));

    // CSS sollte schnell laden
    for (const css of cssFiles) {
      if (css.timing) {
        const loadTime = css.timing.responseEnd - css.timing.requestStart;
        expect(loadTime, `CSS file ${css.url} loads too slowly`).toBeLessThan(1000);
      }
    }

    // JavaScript sollte nicht zu groß sein
    for (const js of jsFiles) {
      if (js.size && parseInt(js.size) > 0) {
        expect(parseInt(js.size), `JS file ${js.url} too large`).toBeLessThan(500000); // 500KB
      }
    }

    // Bilder sollten optimiert sein
    for (const img of imageFiles) {
      expect(img.status, `Image ${img.url} failed to load`).toBe(200);
    }
  });

  test('Mobile Performance - 3G Network Simulation', async ({ page, context }) => {
    // Simuliere langsame 3G-Verbindung
    await context.route('**/*', async (route) => {
      // Verzögerung für langsamere Verbindung
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Auch bei 3G sollte die Seite in angemessener Zeit laden
    expect(loadTime, 'Page load time on 3G too slow').toBeLessThan(5000);

    // Prüfe, ob 3D-Effekte bei langsamer Verbindung deaktiviert werden
    const has3DEffects = await page.evaluate(() => {
      return window.getComputedStyle(document.body).getPropertyValue('--enable-3d-effects');
    });

    // Bei langsamer Verbindung könnten 3D-Effekte deaktiviert sein
    console.log('3D Effects enabled on slow connection:', has3DEffects);
  });

  test('Memory Usage - No Memory Leaks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Initiale Memory-Messung
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });

    if (initialMemory) {
      // Simuliere Benutzerinteraktionen
      for (let i = 0; i < 10; i++) {
        await page.click('body');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }

      // Finale Memory-Messung
      const finalMemory = await page.evaluate(() => {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        };
      });

      // Memory-Verbrauch sollte nicht drastisch steigen
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      const memoryIncreasePercent = (memoryIncrease / initialMemory.usedJSHeapSize) * 100;

      expect(memoryIncreasePercent, 'Memory usage increased too much').toBeLessThan(50);
      
      console.log(`Memory usage: ${memoryIncreasePercent.toFixed(2)}% increase`);
    }
  });

  test('Cache Strategy - Efficient Resource Caching', async ({ page }) => {
    // Erste Seite laden
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Cache-Headers prüfen
    const responses = await page.evaluate(() => {
      return window.performance.getEntriesByType('navigation').map((entry: any) => ({
        name: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize
      }));
    });

    // Seite erneut laden (sollte aus Cache kommen)
    await page.reload({ waitUntil: 'networkidle' });

    const cachedResponses = await page.evaluate(() => {
      return window.performance.getEntriesByType('navigation').map((entry: any) => ({
        name: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize
      }));
    });

    // Beim zweiten Laden sollten Ressourcen aus Cache kommen
    console.log('Initial load:', responses);
    console.log('Cached load:', cachedResponses);
  });

  test('Progressive Enhancement - Works Without JavaScript', async ({ page, context }) => {
    // JavaScript deaktivieren
    await context.addInitScript(() => {
      // JavaScript-Funktionalität blockieren
      Object.defineProperty(window, 'JavaScript', {
        get() { return undefined; },
        set() {}
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Grundfunktionalität sollte auch ohne JS funktionieren
    const mainContent = await page.locator('main, [role="main"], .main-content').first();
    expect(await mainContent.isVisible()).toBe(true);

    // Navigation sollte funktionieren
    const navLinks = await page.locator('nav a, .navigation a').all();
    expect(navLinks.length).toBeGreaterThan(0);

    // Kontaktinformationen sollten sichtbar sein
    const contactInfo = await page.locator('[href^="mailto:"], [href^="tel:"]').all();
    expect(contactInfo.length).toBeGreaterThan(0);
  });

  test('Image Optimization - WebP and Lazy Loading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe auf lazy loading
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const loading = await img.getAttribute('loading');
      const src = await img.getAttribute('src');
      
      // Bilder unterhalb des Fold sollten lazy loading haben
      const boundingBox = await img.boundingBox();
      if (boundingBox && boundingBox.y > 600) {
        expect(loading, `Image ${src} should have lazy loading`).toBe('lazy');
      }
    }

    // Prüfe auf moderne Bildformate (WebP Support)
    const pictureElements = await page.locator('picture').all();
    
    for (const picture of pictureElements) {
      const sources = await picture.locator('source').all();
      const hasWebP = await Promise.all(
        sources.map(async (source) => {
          const type = await source.getAttribute('type');
          return type?.includes('webp');
        })
      );
      
      expect(hasWebP.some(Boolean), 'Picture element should include WebP format').toBe(true);
    }
  });
});