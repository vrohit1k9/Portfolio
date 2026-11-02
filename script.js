document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ==========================================================================
    // PRELOADER DISMISS
    // ==========================================================================
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1200); // Give the animation a moment to feel premium
    });

    // Fallback if load event already fired or delayed
    setTimeout(() => {
        if (loader && loader.style.display !== 'none') {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 3000);

    // ==========================================================================
    // CUSTOM CURSOR FOLLOWER
    // ==========================================================================
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let speed = 0.15; // Smooth interpolation factor
    let isMoving = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isMoving) {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '1';
            isMoving = true;
        }

        // Dot follows cursor immediately
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    // Smooth transition animation loop for outer circle
    function animateCursor() {
        // Linear interpolation (lerp)
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover interactions
    const hoverElements = document.querySelectorAll('a, button, .glass-card, .social-icon, .skill-badge, input, textarea');
    hoverElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        elem.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
        isMoving = false;
    });

    // ==========================================================================
    // STICKY HEADER & ACTIVE SECTION HIGHLIGHTING (SCROLL SPY)
    // ==========================================================================
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    window.addEventListener('scroll', () => {
        // Sticky Header effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll Spy active page marker
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset for sticky nav
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            // Update Desktop Nav
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });

            // Update Mobile Nav
            mobileNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // ==========================================================================
    // MOBILE NAVIGATION DRAWER
    // ==========================================================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks = document.querySelectorAll('.mobile-nav-link, .btn-drawer');

    function toggleMenu() {
        mobileToggle.classList.toggle('open');
        mobileDrawer.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    }

    mobileToggle.addEventListener('click', toggleMenu);

    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside of links (in blank space of drawer)
    document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('open') && 
            !mobileDrawer.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            toggleMenu();
        }
    });

    // ==========================================================================
    // CYBERSECURITY CANVAS PARTICLE SYSTEM
    // ==========================================================================
    const canvas = document.getElementById('cyber-particles');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let connectionDistance = 120;
    let particleCount = 60;
    
    // Adjust node count based on screen size
    if (window.innerWidth < 768) {
        particleCount = 30;
        connectionDistance = 80;
    }

    let mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Set Canvas Dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Re-adjust node count
        if (window.innerWidth < 768) {
            particleCount = 30;
            connectionDistance = 80;
        } else {
            particleCount = 60;
            connectionDistance = 120;
        }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Object
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4; // very slow movements
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
            ctx.fill();
        }

        update() {
            // Keep particles inside boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Move
            this.x += this.vx;
            this.y += this.vy;

            // Draw
            this.draw();
        }
    }

    // Initialize Particle Fleet
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    // Line drawing utility
    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    // Fade out line color the further away they are
                    const opacity = 1 - (dist / connectionDistance);
                    ctx.strokeStyle = `rgba(0, 112, 243, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }

            // Connection to Mouse Pointer
            if (mouse.x !== null && mouse.y !== null) {
                const dxMouse = particles[a].x - mouse.x;
                const dyMouse = particles[a].y - mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distMouse < mouse.radius) {
                    const opacity = 1 - (distMouse / mouse.radius);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${opacity * 0.25})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => p.update());
        connectParticles();

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ==========================================================================
    // HERO TYPING ANIMATION ENGINE
    // ==========================================================================
    const typingSpan = document.getElementById('typing-text');
    const roles = [
        "Aspiring Cybersecurity Professional",
        "Information Security Specialist",
        "Full-Stack Developer",
        "AI & Systems Engineer"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let erasingSpeed = 50;
    let delayBetweenRoles = 2000;

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typingSpan.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(type, 500); // brief pause before writing next
            } else {
                setTimeout(type, erasingSpeed);
            }
        } else {
            typingSpan.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(type, delayBetweenRoles); // pause at completed word
            } else {
                setTimeout(type, typingSpeed);
            }
        }
    }
    
    // Start typing cycle
    setTimeout(type, 2000);

    // ==========================================================================
    // SCROLL REVEAL & SKILLS PROGRESS ANIMATOR
    // ==========================================================================
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const skillBars = document.querySelectorAll('.skill-bar-fill');

    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it's the skills section, animate skill meters
                if (entry.target.getAttribute('id') === 'skills') {
                    skillBars.forEach(bar => {
                        const width = bar.style.width;
                        bar.style.width = '0'; // reset
                        setTimeout(() => {
                            bar.style.width = width; // animate to true value
                        }, 100);
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(elem => {
        scrollObserver.observe(elem);
    });

    // ==========================================================================
    // CONTACT FORM VALIDATOR & MOCK TRANSCEIVER
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = contactForm.querySelector('.btn-submit');
    const submitIcon = document.getElementById('send-icon');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name').value.trim();
        const emailInput = document.getElementById('email').value.trim();
        const subjectInput = document.getElementById('subject').value.trim();
        const messageInput = document.getElementById('message').value.trim();

        // Simple format checks
        if (!nameInput || !emailInput || !subjectInput || !messageInput) {
            showFeedback('ERROR: All payload lines must be populated.', 'error');
            return;
        }

        // Animate submission
        submitBtn.disabled = true;
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <span>ENCRYPTING MESSAGE...</span>
            <i data-lucide="loader-2" class="spin-icon"></i>
        `;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        try {
            // Determine backend target dynamically to support local static server testing (e.g. Live Server on port 5500)
            const apiBase = window.location.origin.startsWith('file://') || !window.location.port || window.location.port !== '8080'
                ? 'http://localhost:8080'
                : '';
            const response = await fetch(`${apiBase}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput,
                    email: emailInput,
                    subject: subjectInput,
                    message: messageInput
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                submitBtn.innerHTML = `
                    <span>SECURELY DISPATCHED</span>
                    <i data-lucide="shield-check"></i>
                `;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                
                showFeedback(`SUCCESS: Message logged to database. Telemetry Signature: [${result.hash}].`, 'success');
                
                // Clear inputs
                contactForm.reset();
            } else {
                throw new Error(result.message || 'Submission failed.');
            }
        } catch (error) {
            console.error('Secure dispatch failed:', error.message);
            submitBtn.innerHTML = `
                <span>DISPATCH FAILED</span>
                <i data-lucide="shield-alert"></i>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            showFeedback(`ERROR: Database connection timeout. [${error.message}]`, 'error');
        } finally {
            // Restore button after delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 4000);
        }
    });

    function showFeedback(text, type) {
        formFeedback.textContent = text;
        formFeedback.className = 'form-feedback-message'; // clear previous
        formFeedback.classList.add(type);
        
        // Auto fade out feedback after 6 seconds
        setTimeout(() => {
            formFeedback.style.opacity = '0';
            setTimeout(() => {
                formFeedback.style.display = 'none';
                formFeedback.style.opacity = '1'; // reset
            }, 500);
        }, 6000);
    }
});
