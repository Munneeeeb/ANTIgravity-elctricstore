// ===== CONFIGURATION =====
const CONFIG = {
    // Replace with your actual webhook URLs
    LEAD_WEBHOOK: 'https://your-webhook-url.com/lead',
    NEWSLETTER_WEBHOOK: 'https://your-webhook-url.com/newsletter',
    PURCHASE_WEBHOOK: 'https://your-webhook-url.com/purchase',

    // Alternative integrations (uncomment and configure as needed)
    // GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    // AIRTABLE_API: 'https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE',
    // FIRESTORE_ENDPOINT: 'https://your-project.firebaseio.com/leads.json',
    // N8N_WEBHOOK: 'https://your-n8n-instance.com/webhook/YOUR_WEBHOOK_ID',
};

// ===== NAVIGATION =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Sticky navbar on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.boxShadow = 'var(--shadow-lg)';
    } else {
        navbar.style.boxShadow = 'var(--shadow-sm)';
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== ANIMATED COUNTERS =====
const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString() + (element.parentElement.querySelector('.stat-label').textContent.includes('Rate') ? '%' : '+');
        }
    };

    updateCounter();
};

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                if (!counter.classList.contains('animated')) {
                    counter.classList.add('animated');
                    animateCounter(counter);
                }
            });
        }
    });
}, observerOptions);

const socialProofSection = document.querySelector('.social-proof');
if (socialProofSection) {
    observer.observe(socialProofSection);
}

// ===== FORM HANDLING =====

// Lead Capture Form
async function handleLeadSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    const formData = {
        name: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        timestamp: new Date().toISOString(),
        source: 'Lead Capture Form',
        page: window.location.href
    };

    try {
        // Send to webhook
        const response = await fetch(CONFIG.LEAD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showSuccessModal('Thank you! We\'ve received your information and will contact you within 24 hours.');
            form.reset();

            // Track conversion (Google Analytics example)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'lead_submission', {
                    'event_category': 'Lead Generation',
                    'event_label': 'Main Lead Form'
                });
            }
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback: Store in localStorage
        storeLeadLocally(formData);
        showSuccessModal('Thank you! Your information has been saved. We\'ll be in touch soon.');
        form.reset();
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Newsletter Form
async function handleNewsletterSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const formData = {
        email: document.getElementById('newsletter-email').value,
        timestamp: new Date().toISOString(),
        source: 'Newsletter Signup',
        page: window.location.href
    };

    try {
        const response = await fetch(CONFIG.NEWSLETTER_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showSuccessModal('Success! You\'re now subscribed to our newsletter.');
            form.reset();

            if (typeof gtag !== 'undefined') {
                gtag('event', 'newsletter_signup', {
                    'event_category': 'Newsletter',
                    'event_label': 'Footer Newsletter'
                });
            }
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        storeNewsletterLocally(formData);
        showSuccessModal('Thank you for subscribing! Welcome to our community.');
        form.reset();
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// Purchase Handler
async function handlePurchase(plan, price) {
    const purchaseData = {
        plan: plan,
        price: price,
        timestamp: new Date().toISOString(),
        page: window.location.href,
        userAgent: navigator.userAgent
    };

    try {
        // Send purchase intent to webhook
        await fetch(CONFIG.PURCHASE_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData)
        });

        if (typeof gtag !== 'undefined') {
            gtag('event', 'begin_checkout', {
                'event_category': 'Ecommerce',
                'event_label': plan,
                'value': price
            });
        }
    } catch (error) {
        console.error('Error tracking purchase:', error);
    }

    // Redirect to checkout or show purchase modal
    // Replace with your actual checkout URL
    showSuccessModal(`Great choice! You've selected the ${plan} plan. Redirecting to secure checkout...`);

    // Simulate redirect (replace with actual checkout URL)
    setTimeout(() => {
        // window.location.href = `checkout.html?plan=${plan}&price=${price}`;
        console.log(`Would redirect to checkout for ${plan} plan at $${price}/month`);
    }, 2000);
}

// ===== LOCAL STORAGE FALLBACK =====
function storeLeadLocally(data) {
    const leads = JSON.parse(localStorage.getItem('leads') || '[]');
    leads.push(data);
    localStorage.setItem('leads', JSON.stringify(leads));
    console.log('Lead stored locally:', data);
}

function storeNewsletterLocally(data) {
    const subscribers = JSON.parse(localStorage.getItem('newsletter') || '[]');
    subscribers.push(data);
    localStorage.setItem('newsletter', JSON.stringify(subscribers));
    console.log('Newsletter subscription stored locally:', data);
}

// Export stored data (for manual retrieval)
function exportStoredData() {
    const leads = localStorage.getItem('leads');
    const newsletter = localStorage.getItem('newsletter');

    const data = {
        leads: JSON.parse(leads || '[]'),
        newsletter: JSON.parse(newsletter || '[]')
    };

    console.log('Stored Data:', data);

    // Create downloadable JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${new Date().toISOString()}.json`;
    link.click();
}

// ===== MODAL FUNCTIONS =====
function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const messageElement = document.getElementById('modal-message');

    messageElement.textContent = message;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('success-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'success-modal') {
        closeModal();
    }
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===== LAZY LOADING IMAGES =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== URGENCY TIMER (Optional) =====
function updateUrgencyCounter() {
    const urgencyElement = document.querySelector('.urgency-message strong');
    if (urgencyElement) {
        // Simulate decreasing slots (resets daily)
        const today = new Date().toDateString();
        let slots = localStorage.getItem('urgency-slots-' + today);

        if (!slots) {
            slots = Math.floor(Math.random() * 5) + 5; // Random 5-10
            localStorage.setItem('urgency-slots-' + today, slots);
        }

        urgencyElement.textContent = slots + ' slots left';
    }
}

updateUrgencyCounter();

// ===== SCROLL ANIMATIONS =====
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

// Add animation classes to elements
document.querySelectorAll('.feature-card, .value-card, .testimonial-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    animateOnScroll.observe(el);
});

// ===== CONSOLE WELCOME MESSAGE =====
console.log('%c⚡ Welcome to Al Muneeb Electric Store!', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cTo export stored leads and newsletter data, run: exportStoredData()', 'font-size: 12px; color: #666;');

// ===== INTEGRATION EXAMPLES =====

// Example: Google Sheets Integration
async function sendToGoogleSheets(data, sheetName) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sheet: sheetName,
                data: data
            })
        });
        return true;
    } catch (error) {
        console.error('Google Sheets error:', error);
        return false;
    }
}

// Example: Airtable Integration
async function sendToAirtable(data) {
    try {
        const response = await fetch(CONFIG.AIRTABLE_API, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_AIRTABLE_API_KEY',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: data
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Airtable error:', error);
        return false;
    }
}

// Example: Firebase/Firestore Integration
async function sendToFirestore(data) {
    try {
        const response = await fetch(CONFIG.FIRESTORE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (error) {
        console.error('Firestore error:', error);
        return false;
    }
}

// ===== WHATSAPP INTEGRATION =====
function openWhatsApp(message = 'Hi, I\'m interested in your services') {
    const phoneNumber = '1234567890'; // Replace with your WhatsApp number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Make functions globally available
window.handleLeadSubmit = handleLeadSubmit;
window.handleNewsletterSubmit = handleNewsletterSubmit;
window.handlePurchase = handlePurchase;
window.closeModal = closeModal;
window.exportStoredData = exportStoredData;
window.openWhatsApp = openWhatsApp;
