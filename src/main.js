let allProjects = [];

async function loadData() {
    try {
        const [profileRes, projectsRes] = await Promise.all([
            fetch('./src/data/profile.json'),
            fetch('./src/data/projects.json')
        ]);

        const profile = await profileRes.json();
        allProjects = await projectsRes.json();

        renderProfile(profile);
        renderProblems(profile.problems_section);
        renderProjects(allProjects);
        setupModal();
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

    const contactInfo = document.getElementById('contact-info');
    contactInfo.innerHTML = `
        <p>📧 ${profile.contact.email}</p>
        <p>🕒 連絡可能時間: ${profile.contact.contact_time}</p>
        <p>⏳ 稼働時間: ${profile.contact.work_hours}</p>
    `;
}

function renderProblems(problems) {
    const problemsContainer = document.getElementById('problems-content');
    if (!problems || !problemsContainer) return;

    const titleElement = document.getElementById('problems-title');
    if (titleElement) titleElement.textContent = problems.title;

    problemsContainer.innerHTML = `
        <div class="problems-grid">
            ${problems.items.map(item => `<div class="problem-card">${item}</div>`).join('')}
        </div>
        <div class="solution-banner">
            <p>${problems.solution_message}</p>
        </div>
    `;
}

function renderProjects(projects) {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = projects.map((project, index) => `
        <div class="project-card" data-index="${index}" style="cursor: pointer;">
            <div class="card-image">
                ${project.image ? `<img src="${project.image}" alt="${project.title}">` : 'No Image'}
            </div>
            <h3 class="card-title">${project.title}</h3>
            <p class="card-description">${project.description.concept}</p>
            <div class="card-tags" style="margin-top: 10px; font-size: 0.8rem;">
                ${project.tools.map(tool => `<span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; margin-right: 5px;">${tool}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Add click events to cards
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
        'modal-label-target': '🌟 作品のターゲット',
        'modal-label-effort': '🎨 制作のこだわり',
        'modal-label-solution': '✨ 解決のポイント',
        'modal-label-detail': '💡 ご相談内容・お悩み'
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

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
}

loadData();
