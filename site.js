document.addEventListener('DOMContentLoaded', () => {
    let contentText = {};
    let currentLanguage = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('language') || 'en';
    let activePage = window.location.hash ? window.location.hash.substring(1) : 'button1';

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`./lang/${lang}.json`);
            contentText = await response.json();
            loadButtons(contentText.buttons);
            changeContent(activePage);

            const languageSelector = document.querySelector('.language-selector select');
            if (languageSelector) languageSelector.value = lang;
        } catch (error) {
            console.error('Error loading language file:', error);
        }
    }

    function loadButtons(buttons) {
        const nav = document.getElementById('nav-buttons');
        nav.innerHTML = '';
        Object.keys(buttons).forEach((key) => {
            const button = document.createElement('button');
            button.textContent = buttons[key];
            button.setAttribute('data-page', key);
            button.onclick = () => {
                if (key !== activePage) changeContent(key);
            };
            nav.appendChild(button);
        });
    }

    function changeContent(page) {
        const content = document.getElementById('content');
        content.style.opacity = '0';

        const buttons = document.querySelectorAll('#nav-buttons button');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.disabled = false;
        });

        const activeButton = document.querySelector(`#nav-buttons button[data-page="${page}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.disabled = true;
        }

        activePage = page;
        window.location.hash = page;

        setTimeout(() => {
            content.innerHTML = '<div class="news-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">' +
                (contentText[page]?.articles?.map(article =>
                    `<div class="news-box" onclick="window.location.href='${article.link}?id=${article.id}&lang=${currentLanguage}'">
                        <div class="thumbnail-container">
                            <img src="./thumb/${article.thumbnail}" alt="${article.title}" class="news-thumbnail">
                        </div>
                        <h3>${article.title}</h3>
                        <p>${article.summary}</p>
                    </div>`
                ).join('') || 'Content not available') + '</div>';
            content.style.opacity = '1';
        }, 500);
    }

    function changeLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        loadLanguage(lang);
    }

    window.changeLanguage = changeLanguage;
    loadLanguage(currentLanguage);
});
