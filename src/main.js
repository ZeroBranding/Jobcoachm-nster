import '../assets/app.css';
import '../assets/app.js';

// Lazy-load heavy 3D bundle only if user hasn’t requested reduced motion
function load3D() {
  import('../assets/3d.js').then((mod) => {
    if (typeof mod.init3D === 'function') {
      mod.init3D();
    }
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const hero = document.getElementById('hero-3d-container');
  if (hero) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting) {
          load3D();
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px 200px 0px' }
    );
    observer.observe(hero);
  }
}