let allProjects = [];

function setupRevealAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    // Target sections and cards
    const targets = document.querySelectorAll('section, .project-card');
    targets.forEach(target => {
        target.classList.add('reveal');
        observer.observe(target);
    });
}

async function loadData() {
    try {
        const [profileRes, projectsRes] = await Promise.all([
            fetch('./src/data/profile.json'),
            fetch('./src/data/projects.json')
        ]);

        const profile = await profileRes.json();
        allProjects = await projectsRes.json();

        renderProfile(profile);
        renderProjects(allProjects);
        setupCategoryFilter();
        setupModal();
        setupAboutModal();
        setupSmoothScroll();
        setupRevealAnimation();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
    }
}

function renderProfile(profile) {
    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-title').textContent = profile.title;
    document.getElementById('user-catchphrase').textContent = profile.catchphrase;
    document.getElementById('user-bio').textContent = profile.bio;

    const userImage = document.getElementById('user-image');
    if (profile.image) {
        userImage.src = profile.image;
        userImage.style.display = 'block';
    } else {
        userImage.style.display = 'none';
    }

    const contactMessage = document.getElementById('contact-message');
    if (contactMessage) {
        contactMessage.textContent = profile.contact.message || "作品に関するお問い合わせは、下記よりお気軽にどうぞ。";
    }

    const contactInfo = document.getElementById('contact-info');
    contactInfo.innerHTML = `
        <p>📧 ${profile.contact.email}</p>
        ${profile.contact.lancers_url ? `<p>🔗 <a href="${profile.contact.lancers_url}" target="_blank">Lancers</a></p>` : ''}
        ${profile.contact.cloudworks_url ? `<p>🔗 <a href="${profile.contact.cloudworks_url}" target="_blank">CloudWorks</a></p>` : ''}
    `;

    // About Me Section Logic
    if (profile.about_me) {
        const aboutBtn = document.getElementById('open-about-modal');
        if (aboutBtn) {
            aboutBtn.style.display = 'inline-flex';
            
            // Populate About Modal Data
            document.getElementById('about-image').src = profile.image;
            document.getElementById('about-name').textContent = profile.name;
            document.getElementById('about-title').textContent = profile.title;
            document.getElementById('about-intro').innerHTML = profile.about_me.intro;
            
            if (profile.about_me.strengths && Array.isArray(profile.about_me.strengths)) {
                const strengthsHtml = profile.about_me.strengths.map(s => `
                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border-left: 3px solid var(--accent-sage);">
                        <h4 style="color: var(--accent-sage); margin-bottom: 5px;">${s.title}</h4>
                        <p style="font-size: 0.9rem;">${s.desc}</p>
                    </div>
                `).join('');
                document.getElementById('about-strengths').innerHTML = strengthsHtml;
            }
            document.getElementById('about-message').innerHTML = profile.about_me.message;
        }
    }
}

function setupCategoryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            const filtered = category === 'all'
                ? allProjects
                : allProjects.filter(p => p.category === category);

            renderProjects(filtered);
            setupRevealAnimation(); // re-animate for filtered results
        });
    });
}

function renderProjects(projects) {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = projects.map((project) => {
        // Find the actual index in allProjects to keep modal accurate
        const realIndex = allProjects.findIndex(p => p.id === project.id);
        return `
            <div class="project-card" data-index="${realIndex}" style="cursor: pointer;">
                <div class="card-image">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}">` : 'No Image'}
                </div>
                <h3 class="card-title">${project.title}</h3>
                <p class="card-description">${project.description.concept}</p>
                <div class="card-tags" style="margin-top: 10px; font-size: 0.8rem;">
                    ${project.tools.map(tool => `<span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; margin-right: 5px;">${tool}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Re-bind click events
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = card.getAttribute('data-index');
            openModal(allProjects[index]);
        });
    });
}

function setupModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // ESC key to close
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function setupAboutModal() {
    document.addEventListener('click', (e) => {
        // Open button click
        if (e.target.closest('#open-about-modal')) {
            e.preventDefault();
            const modal = document.getElementById('about-modal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        }
        
        // Close button click
        if (e.target.closest('#close-about-modal')) {
            const modal = document.getElementById('about-modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
        
        // Overlay click
        if (e.target.matches('#about-modal .modal-overlay')) {
            const modal = document.getElementById('about-modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const aboutModal = document.getElementById('about-modal');
            if (aboutModal && !aboutModal.classList.contains('hidden')) {
                aboutModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    });
}

function openModal(project) {
    const modal = document.getElementById('project-modal');

    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-image').src = project.image;
    document.getElementById('modal-target').textContent = project.description.target;
    document.getElementById('modal-effort').textContent = project.description.effort || '製作中...';
    document.getElementById('modal-solution').textContent = project.description.solution || '製作中...';
    document.getElementById('modal-detail').textContent = project.description.detail;

    // Change labels to Before/After perspective
    const labels = {
        'modal-label-target': ' 作品のターゲット',
        'modal-label-effort': ' 制作のこだわり',
        'modal-label-solution': ' 制作・解決のポイント',
        'modal-label-detail': ' ご依頼内容・お悩み'
    };

    Object.entries(labels).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });

    const toolsContainer = document.getElementById('modal-tools');
    toolsContainer.innerHTML = project.tools.map(tool => `<span>${tool}</span>`).join('');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Header height for offset
                const headerOffset = document.getElementById('main-header').offsetHeight;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Active link highlighting on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = ['hero', 'works', 'contact'];
        const headerOffset = document.getElementById('main-header').offsetHeight;

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - headerOffset - 100) {
                    current = sectionId;
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === current) {
                link.classList.add('active');
            }
        });
    });
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
}

loadData();

