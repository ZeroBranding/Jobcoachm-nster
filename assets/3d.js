/**
 * 3D/Hologram Effects with Three.js
 * Progressive enhancement with fallbacks and reduced motion support
 */

class HologramEffect {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.animationId = null;
        this.container = null;
        this.isInitialized = false;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isLowPower = this.detectLowPowerMode();
        
        this.init();
    }

    async init() {
        // Only initialize if 3D is supported and user preferences allow it
        if (this.isReducedMotion || this.isLowPower) {
            this.setupFallback();
            return;
        }

        this.container = document.getElementById('hero-3d-container');
        if (!this.container) return;

        // Check if container is visible before loading Three.js
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isInitialized) {
                    this.loadThreeJS();
                    observer.disconnect();
                }
            });
        });

        observer.observe(this.container);
    }

    async loadThreeJS() {
        try {
            // Dynamically import Three.js to reduce initial bundle size
            const THREE = await this.loadThreeJSLibrary();
            if (!THREE) {
                this.setupFallback();
                return;
            }

            await this.setupThreeJS(THREE);
            this.setupParticleSystem(THREE);
            this.setupPostProcessing(THREE);
            this.setupEventListeners();
            this.animate();
            this.isInitialized = true;

        } catch (error) {
            console.error('Failed to initialize 3D effects:', error);
            this.setupFallback();
        }
    }

    async loadThreeJSLibrary() {
        try {
            // In a real application, you would load from CDN or bundle
            // For this example, we'll simulate the Three.js API
            return this.createMockThreeJS();
        } catch (error) {
            console.error('Failed to load Three.js:', error);
            return null;
        }
    }

    createMockThreeJS() {
        // Mock Three.js for demonstration - in production use real Three.js
        return {
            Scene: class {
                constructor() {
                    this.children = [];
                }
                add(object) {
                    this.children.push(object);
                }
            },
            PerspectiveCamera: class {
                constructor(fov, aspect, near, far) {
                    this.fov = fov;
                    this.aspect = aspect;
                    this.near = near;
                    this.far = far;
                    this.position = { x: 0, y: 0, z: 5 };
                }
                updateProjectionMatrix() {}
            },
            WebGLRenderer: class {
                constructor(options) {
                    this.domElement = document.createElement('canvas');
                    this.domElement.width = options.canvas?.width || 800;
                    this.domElement.height = options.canvas?.height || 600;
                    this.domElement.style.width = '100%';
                    this.domElement.style.height = '100%';
                }
                setSize(width, height) {
                    this.domElement.width = width;
                    this.domElement.height = height;
                }
                setPixelRatio(ratio) {}
                render(scene, camera) {
                    // Mock render - draw gradient background
                    const ctx = this.domElement.getContext('2d');
                    const gradient = ctx.createLinearGradient(0, 0, this.domElement.width, this.domElement.height);
                    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
                    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);
                }
            },
            BufferGeometry: class {
                setAttribute(name, attribute) {}
            },
            Float32BufferAttribute: class {
                constructor(array, itemSize) {
                    this.array = array;
                    this.itemSize = itemSize;
                }
            },
            PointsMaterial: class {
                constructor(options) {
                    this.color = options.color || 0xffffff;
                    this.size = options.size || 1;
                }
            },
            Points: class {
                constructor(geometry, material) {
                    this.geometry = geometry;
                    this.material = material;
                    this.rotation = { x: 0, y: 0, z: 0 };
                }
            },
            Color: class {
                constructor(color) {
                    this.r = 1;
                    this.g = 1;
                    this.b = 1;
                }
            }
        };
    }

    async setupThreeJS(THREE) {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer setup with performance optimizations
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: window.devicePixelRatio <= 1, // Only antialias on low DPR
            powerPreference: 'low-power' // Prefer integrated GPU
        });

        // Limit pixel ratio for performance
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupParticleSystem(THREE) {
        const particleCount = this.isLowPower ? 500 : 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        // Create particle positions and colors
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Position
            positions[i] = (Math.random() - 0.5) * 10;     // x
            positions[i + 1] = (Math.random() - 0.5) * 10; // y
            positions[i + 2] = (Math.random() - 0.5) * 10; // z

            // Color - gradient from blue to purple
            const colorIndex = i / 3;
            const normalizedIndex = colorIndex / (particleCount - 1);
            
            colors[i] = 0.4 + normalizedIndex * 0.3;     // r
            colors[i + 1] = 0.5 + normalizedIndex * 0.2; // g
            colors[i + 2] = 0.9 + normalizedIndex * 0.1; // b
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    setupPostProcessing(THREE) {
        // Simple RGB shift effect (mock implementation)
        this.rgbShiftAmount = 0.002;
        this.glitchIntensity = 0.1;
    }

    setupEventListeners() {
        // Handle resize
        const handleResize = () => {
            if (!this.camera || !this.renderer) return;

            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        };

        window.addEventListener('resize', this.debounce(handleResize, 250));

        // Handle visibility change to pause animation when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        });

        // Handle mouse/touch movement for parallax
        this.setupParallax();
    }

    setupParallax() {
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (event) => {
            if (this.isReducedMotion) return;

            const rect = this.container.getBoundingClientRect();
            mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const handleTouchMove = (event) => {
            if (this.isReducedMotion) return;
            
            const touch = event.touches[0];
            if (touch) {
                const rect = this.container.getBoundingClientRect();
                mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            }
        };

        this.container.addEventListener('mousemove', handleMouseMove);
        this.container.addEventListener('touchmove', handleTouchMove, { passive: true });

        // Smooth camera movement
        const updateParallax = () => {
            if (!this.camera) return;

            targetX = mouseX * 0.1;
            targetY = mouseY * 0.1;

            this.camera.position.x += (targetX - this.camera.position.x) * 0.02;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.02;
        };

        // Add to animation loop
        this.parallaxUpdate = updateParallax;
    }

    animate() {
        if (!this.isInitialized || !this.scene || !this.camera || !this.renderer) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        // Rotate particles
        if (this.particles && !this.isReducedMotion) {
            this.particles.rotation.x += 0.001;
            this.particles.rotation.y += 0.002;
        }

        // Update parallax
        if (this.parallaxUpdate) {
            this.parallaxUpdate();
        }

        // Add subtle floating animation
        if (!this.isReducedMotion) {
            const time = Date.now() * 0.001;
            if (this.particles) {
                this.particles.position.y = Math.sin(time) * 0.1;
            }
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resumeAnimation() {
        if (this.isInitialized && !this.animationId) {
            this.animate();
        }
    }

    setupFallback() {
        // Create CSS-only fallback animation
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="fallback-background">
                <div class="gradient-orb orb-1"></div>
                <div class="gradient-orb orb-2"></div>
                <div class="gradient-orb orb-3"></div>
            </div>
        `;

        // Add fallback styles
        const style = document.createElement('style');
        style.textContent = `
            .fallback-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            
            .gradient-orb {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.1) 70%, transparent 100%);
                animation: ${this.isReducedMotion ? 'none' : 'float 6s ease-in-out infinite'};
            }
            
            .orb-1 {
                width: 200px;
                height: 200px;
                top: 20%;
                left: 10%;
                animation-delay: 0s;
            }
            
            .orb-2 {
                width: 150px;
                height: 150px;
                top: 60%;
                right: 20%;
                animation-delay: 2s;
            }
            
            .orb-3 {
                width: 100px;
                height: 100px;
                top: 40%;
                left: 60%;
                animation-delay: 4s;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
                50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .gradient-orb {
                    animation: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    detectLowPowerMode() {
        // Detect various low-power indicators
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return true; // No WebGL support

        // Check for low-end GPU
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        
        const lowEndIndicators = [
            'intel', 'integrated', 'software', 'llvm', 'mesa'
        ];
        
        const rendererInfo = (renderer + ' ' + vendor).toLowerCase();
        const isLowEnd = lowEndIndicators.some(indicator => 
            rendererInfo.includes(indicator)
        );

        // Check device memory (if available)
        const deviceMemory = navigator.deviceMemory;
        const isLowMemory = deviceMemory && deviceMemory < 4;

        // Check connection (if available)
        const connection = navigator.connection;
        const isSlowConnection = connection && (
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' ||
            connection.saveData
        );

        return isLowEnd || isLowMemory || isSlowConnection;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    destroy() {
        // Cleanup
        this.pauseAnimation();
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        if (this.particles) {
            if (this.particles.geometry) this.particles.geometry.dispose();
            if (this.particles.material) this.particles.material.dispose();
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.container = null;
        this.isInitialized = false;
    }
}

// CSS 3D Effects and Animations
class CSSEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlassmorphism();
        this.setupTextEffects();
        this.setupScrollAnimations();
        this.setupHoverEffects();
    }

    setupGlassmorphism() {
        // Enhanced glass effect styles
        const style = document.createElement('style');
        style.textContent = `
            .glass-effect {
                position: relative;
                backdrop-filter: blur(10px) saturate(180%);
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 
                    0 8px 32px 0 rgba(31, 38, 135, 0.37),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
            }
            
            .glass-effect::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                opacity: 0.5;
            }
            
            .glass-effect::after {
                content: '';
                position: absolute;
                top: 1px;
                left: 1px;
                right: 1px;
                bottom: 1px;
                border-radius: inherit;
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%, 
                    rgba(255, 255, 255, 0.05) 50%, 
                    rgba(255, 255, 255, 0.1) 100%);
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    setupTextEffects() {
        // Enhanced text effects
        const style = document.createElement('style');
        style.textContent = `
            .hero-title-main {
                position: relative;
                background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: none;
            }
            
            .hero-title-main::before {
                content: attr(data-text);
                position: absolute;
                top: 0;
                left: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                z-index: -1;
                filter: blur(3px);
                opacity: 0.7;
            }
            
            .neon-text {
                color: #fff;
                text-shadow: 
                    0 0 5px #667eea,
                    0 0 10px #667eea,
                    0 0 20px #667eea,
                    0 0 40px #667eea;
                animation: ${window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'neon-flicker 2s infinite alternate'};
            }
            
            @keyframes neon-flicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }

    setupScrollAnimations() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // CSS Scroll-linked animations with fallback
        const style = document.createElement('style');
        style.textContent = `
            @supports (animation-timeline: scroll()) {
                .scroll-fade {
                    animation: scroll-fade linear;
                    animation-timeline: scroll();
                    animation-range: entry 0% cover 30%;
                }
                
                @keyframes scroll-fade {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            }
            
            .animate-in {
                animation: fade-in-up 0.6s ease-out forwards;
            }
            
            @keyframes fade-in-up {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupHoverEffects() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const style = document.createElement('style');
        style.textContent = `
            .btn {
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
            }
            
            .btn:hover::before {
                left: 100%;
            }
            
            .service-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform-style: preserve-3d;
            }
            
            .service-card:hover {
                transform: translateY(-10px) rotateX(5deg);
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.25),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
            }
            
            .service-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.6s;
            }
            
            .service-card:hover::before {
                left: 100%;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D effects
    const hologramEffect = new HologramEffect();
    
    // Initialize CSS effects
    const cssEffects = new CSSEffects();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (hologramEffect) {
            hologramEffect.destroy();
        }
    });
    
    // Export for debugging
    window.HologramEffect = hologramEffect;
    window.CSSEffects = cssEffects;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HologramEffect, CSSEffects };
}