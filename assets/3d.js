// Lightweight 3D/Hologram loader with progressive enhancement.
// Attempts to lazy-load Three.js from CDN. If blocked (e.g., CSP without CDN),
// it fails gracefully and leaves the CSS fallback in place.

function capDevicePixelRatio(maxDpr = 1.75) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  return dpr;
}

export async function initHologram(container) {
  if (!container) return;
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return;

  // Try loading Three.js dynamically. Adjust CSP if needed to allow the CDN host.
  let THREE;
  try {
    ({ default: THREE } = await import('https://unpkg.com/three@0.160.0/build/three.module.js'));
  } catch (err) {
    console.warn('Three.js CDN blocked or unavailable. Keeping CSS fallback.', err);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 3.2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const dpr = capDevicePixelRatio(1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Particles
  const num = 800;
  const positions = new Float32Array(num * 3);
  for (let i = 0; i < num; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 4;
    positions[i3 + 1] = (Math.random() - 0.5) * 2;
    positions[i3 + 2] = (Math.random() - 0.5) * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0x66ccff, size: 0.02, transparent: true, opacity: 0.85 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Subtle RGB split effect via two layers
  const points2 = points.clone();
  points2.material = new THREE.PointsMaterial({ color: 0xcc66ff, size: 0.017, transparent: true, opacity: 0.35 });
  points2.position.x = 0.01;
  points2.position.y = -0.01;
  scene.add(points2);

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    const width = Math.max(320, w);
    const height = Math.max(240, h);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Parallax
  const parallax = { x: 0, y: 0 };
  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    parallax.x = x;
    parallax.y = y;
  };
  window.addEventListener('pointermove', onPointerMove);

  let raf = 0;
  const animate = () => {
    raf = requestAnimationFrame(animate);
    points.rotation.y += 0.0009;
    points2.rotation.y -= 0.0006;
    camera.position.x += (parallax.x * 0.35 - camera.position.x) * 0.03;
    camera.position.y += (-parallax.y * 0.2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  animate();

  // Cleanup on visibility change
  const onHidden = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      animate();
    }
  };
  document.addEventListener('visibilitychange', onHidden);

  // Expose destroy if needed
  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onHidden);
      renderer.dispose();
      geo.dispose();
      container.innerHTML = '';
    }
  };
}

