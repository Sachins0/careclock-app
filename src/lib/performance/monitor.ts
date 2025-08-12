'use client';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Monitor Web Vitals
  measureWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    this.measureFCP();
    
    // Largest Contentful Paint
    this.measureLCP();
    
    // Cumulative Layout Shift
    this.measureCLS();
    
    // First Input Delay
    this.measureFID();
  }

  private measureFCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        console.log('FCP:', fcp.startTime);
        // Send to analytics if needed
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });
  }

  private measureLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private measureCLS(): void {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log('CLS:', clsValue);
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  }

  private measureFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
      }
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  }

  // Monitor app-specific metrics
  measureClockInTime(): void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log('Clock-in operation took:', duration, 'ms');
    };
  }

  measureLocationAccuracy(): void {
    // Monitor geolocation performance
    const startTime = performance.now();
    
    return (accuracy: number) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log('Location acquired in:', duration, 'ms', 'with accuracy:', accuracy);
    };
  }
}
