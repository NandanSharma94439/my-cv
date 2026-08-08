/* =========================================
   PREMIUM PORTFOLIO — script.js
   Enhanced & fully documented
   ========================================= */

/* =========================================
   1. LOADER & INIT
   ========================================= */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');

    // Give a slight delay so the progress bar animation completes
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        document.body.style.overflowY = 'auto';
    }, 1400);

    // Set copyright year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* =========================================
   2. PARTICLE CANVAS BACKGROUND
   ========================================= */
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];

    const CONFIG = {
        count:       80,
        baseRadius:  1.5,
        speed:       0.3,
        connectDist: 140,
        colors:      ['rgba(124,107,174,{a})', 'rgba(155,125,212,{a})', 'rgba(201,123,90,{a})'],
    };

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function randomColor(alpha) {
        const c = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        return c.replace('{a}', alpha);
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push({
                x:  Math.random() * W,
                y:  Math.random() * H,
                vx: (Math.random() - 0.5) * CONFIG.speed,
                vy: (Math.random() - 0.5) * CONFIG.speed,
                r:  Math.random() * CONFIG.baseRadius + 0.5,
                color: randomColor(0.7),
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update & draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < CONFIG.connectDist) {
                    const alpha = (1 - dist / CONFIG.connectDist) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
})();

/* =========================================
   4. NAVIGATION — STICKY, ACTIVE & MOBILE
   ========================================= */
(function initNav() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks  = document.querySelector('.nav-links');
    const backToTop = document.querySelector('.back-to-top');
    const navItems  = document.querySelectorAll('.nav-links li a');

    if (!navbar) return;

    // Sticky navbar & back-to-top button
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('sticky', window.scrollY > 50);
        if (backToTop) backToTop.classList.toggle('active', window.scrollY > 500);
        updateActiveLink();
    }, { passive: true });

    // Mobile hamburger toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen.toString());
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // Close menu on link click
    navItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Active link highlight based on scroll position
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id], header[id]');
        let currentId = '';

        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            if (window.scrollY >= top) currentId = sec.id;
        });

        navItems.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + currentId;
            link.classList.toggle('active', isActive);
        });
    }
})();

/* =========================================
   5. TYPING ANIMATION
   ========================================= */
(function initTyping() {
    const typedSpan = document.querySelector('.typed');
    if (!typedSpan) return;

    // === REPLACE THESE STRINGS WITH YOUR OWN ===
    const phrases     = ['Flutter Apps', 'Firebase Backends', 'Beautiful UIs', 'Performant Systems'];
    // ============================================

    let phraseIdx = 0, charIdx = 0, isDeleting = false;
    const TYPING_SPEED  = 110;
    const ERASING_SPEED = 55;
    const PAUSE_AFTER   = 2200;
    const PAUSE_BEFORE  = 700;

    function tick() {
        const current = phrases[phraseIdx];

        if (!isDeleting) {
            typedSpan.textContent = current.slice(0, ++charIdx);
            if (charIdx === current.length) {
                isDeleting = true;
                setTimeout(tick, PAUSE_AFTER);
                return;
            }
        } else {
            typedSpan.textContent = current.slice(0, --charIdx);
            if (charIdx === 0) {
                isDeleting = false;
                phraseIdx  = (phraseIdx + 1) % phrases.length;
                setTimeout(tick, PAUSE_BEFORE);
                return;
            }
        }

        setTimeout(tick, isDeleting ? ERASING_SPEED : TYPING_SPEED);
    }

    setTimeout(tick, 1000);
})();

/* =========================================
   6. INTERSECTION OBSERVER — SCROLL REVEALS
   ========================================= */
(function initReveal() {
    const options = { threshold: 0.08, rootMargin: '0px 0px -60px 0px' };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('show');

            // Animate skill progress bars when skills section is visible
            if (entry.target.id === 'skills') {
                document.querySelectorAll('.progress').forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            }

            // Animate stat counters when about section is visible
            if (entry.target.id === 'about') {
                document.querySelectorAll('.counter').forEach(counter => {
                    const target    = +counter.getAttribute('data-target');
                    const duration  = 2200;
                    const step      = target / (duration / 16);
                    let current     = 0;

                    function updateCounter() {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.ceil(current) + '+';
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target + '+';
                        }
                    }
                    updateCounter();
                });
            }

            observer.unobserve(entry.target);
        });
    }, options);

    // Observe reveal elements
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
        .forEach(el => observer.observe(el));

    // Observe trigger sections
    const skills = document.getElementById('skills');
    const about  = document.getElementById('about');
    if (skills) observer.observe(skills);
    if (about)  observer.observe(about);
})();

/* =========================================
   7. 3D TILT EFFECT
   ========================================= */
(function initTilt() {
    if (window.innerWidth <= 768) return;

    document.querySelectorAll('.tilt-element').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect    = el.getBoundingClientRect();
            const x       = e.clientX - rect.left;
            const y       = e.clientY - rect.top;
            const centerX = rect.width  / 2;
            const centerY = rect.height / 2;
            const rotX    = ((y - centerY) / centerY) * -8;
            const rotY    = ((x - centerX) / centerX) *  8;

            el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
            el.style.transition = 'transform 0.1s ease';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform  = 'perspective(1200px) rotateX(0) rotateY(0) scale3d(1,1,1)';
            el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        });
    });
})();

/* =========================================
   8. PROJECT FILTER
   ========================================= */
(function initFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards      = document.querySelectorAll('.project-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            cards.forEach((card, i) => {
                const match = filter === 'all' || card.getAttribute('data-category') === filter;

                card.style.transition = `opacity 0.3s ease ${i * 0.03}s, transform 0.3s ease ${i * 0.03}s`;
                card.style.opacity    = '0';
                card.style.transform  = 'scale(0.9)';

                setTimeout(() => {
                    card.style.display = match ? 'flex' : 'none';

                    if (match) {
                        // Force reflow to trigger transition
                        void card.offsetWidth;
                        card.style.opacity   = '1';
                        card.style.transform = 'scale(1)';
                    }
                }, 280);
            });
        });
    });
})();

/* =========================================
   9. RIPPLE EFFECT ON BUTTONS
   ========================================= */
(function initRipple() {
    document.querySelectorAll('.ripple').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect  = this.getBoundingClientRect();
            const span  = document.createElement('span');
            span.classList.add('ripple-span');
            span.style.left = (e.clientX - rect.left) + 'px';
            span.style.top  = (e.clientY - rect.top)  + 'px';
            this.appendChild(span);
            span.addEventListener('animationend', () => span.remove());
        });
    });
})();

/* =========================================
   10. CONTACT FORM VALIDATION
   ========================================= */
(function initForm() {
    const form       = document.getElementById('contactForm');
    if (!form) return;

    const nameInput  = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const msgInput   = document.getElementById('message');
    const successMsg = form.querySelector('.form-success');
    const submitBtn  = document.getElementById('submitBtn');

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validate(input, condition) {
        const group = input.parentElement;
        if (condition) {
            group.classList.remove('error');
            return true;
        } else {
            group.classList.add('error');
            return false;
        }
    }

    // Real-time validation on blur
    [nameInput, emailInput, subjectInput, msgInput].forEach(input => {
        if (!input) return;
        input.addEventListener('blur', () => {
            if (input === emailInput) {
                validate(input, emailRe.test(input.value.trim()));
            } else {
                validate(input, input.value.trim() !== '');
            }
        });
        input.addEventListener('input', () => {
            input.parentElement.classList.remove('error');
        });
    });

    form.addEventListener('submit', e => {
        e.preventDefault();

        let isValid = true;
        isValid = validate(nameInput,    nameInput.value.trim() !== '')       && isValid;
        isValid = validate(emailInput,   emailRe.test(emailInput.value.trim())) && isValid;
        if (subjectInput) {
            isValid = validate(subjectInput, subjectInput.value.trim() !== '') && isValid;
        }
        isValid = validate(msgInput,     msgInput.value.trim() !== '')         && isValid;

        if (!isValid) return;

        // ── Backend API URL ────────────────────────────────────
        const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000'
            : '';

        // ── Send to backend ────────────────────────────────────
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending... <i class="bx bx-loader-alt bx-spin"></i>';
        submitBtn.disabled  = true;

        fetch(`${API_BASE_URL}/api/contact`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name:    nameInput.value.trim(),
                email:   emailInput.value.trim(),
                subject: subjectInput ? subjectInput.value.trim() : '',
                message: msgInput.value.trim(),
            }),
        })
        .then(async res => {
            const data = await res.json();
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled  = false;

            if (data.success) {
                form.reset();
                if (successMsg) {
                    successMsg.style.display = 'flex';
                    setTimeout(() => { successMsg.style.display = 'none'; }, 5000);
                }
            } else {
                // Show backend validation error to the user
                alert(data.message || 'Something went wrong. Please try again.');
            }
        })
        .catch(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled  = false;
            alert('Could not reach the server. Please check your connection and try again.');
        });
    });
})();

/* =========================================
   11. SECTION BACKGROUND PARALLAX HINT
       (Subtle depth effect on scroll)
   ========================================= */
(function initParallax() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    window.addEventListener('scroll', () => {
        const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        canvas.style.transform = `translateY(${scrollFraction * 40}px)`;
    }, { passive: true });
})();