document.addEventListener('DOMContentLoaded', () => {
    let contentText = {};
    let currentLanguage = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('language') || 'en';

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`./lang/${lang}.json`);
            contentText = await response.json();
            loadButtons(contentText.buttons);

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
            button.onclick = () => {
                localStorage.setItem('language', currentLanguage);
                window.location.href = `index.html?lang=${currentLanguage}#${key}`;
            };
            nav.appendChild(button);
        });
    }

    async function loadArticleContent() {
        try {
            const response = await fetch(`./lang/${currentLanguage}.json`);
            const articleData = await response.json();

            let article = null;
            for (let key in articleData) {
                if (articleData[key].articles) {
                    article = articleData[key].articles.find(a => a.link === 'article4.html');
                    if (article) break;
                }
            }

            if (article) {
                document.getElementById('article-title').textContent = article.title || '';
                document.getElementById('article-thumbnail').src = `./thumb/${article.thumbnail}`;
                document.getElementById('article-summary').textContent = article.summary || '';
                document.getElementById('article-author').textContent = `By: ${article.author || 'Unknown'}`;
                document.getElementById('article-content').innerHTML = marked.parse(article.content || 'Details are currently unavailable.');
                document.getElementById('article-end-summary').textContent = article.end_summary || '';
            } else {
                document.getElementById('article-title').textContent = 'Article not found';
                document.getElementById('article-content').textContent = 'The requested content could not be loaded.';
            }
        } catch (error) {
            console.error('Error loading article content:', error);
        }
    }

    function changeLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        loadLanguage(lang);

        const languageSelector = document.querySelector('.language-selector select');
        if (languageSelector) languageSelector.value = lang;

        const isArticlePage = document.getElementById('article-title');
        if (isArticlePage) {
            loadArticleContent();
        }
    }

    async function loadComments() {
        try {
            const comments = JSON.parse(localStorage.getItem('comments')) || [];
            const commentsList = document.getElementById('comments-list');
            commentsList.innerHTML = '';

            comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `<strong>${comment.name}</strong>: ${comment.text}`;
                commentsList.appendChild(commentDiv);
            });
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    function submitComment() {
        const nameInput = document.getElementById('name-input');
        const commentInput = document.getElementById('comment-input');
        const name = nameInput.value.trim() || 'Anonymous';
        const commentText = commentInput.value.trim();

        if (commentText) {
            let comments = JSON.parse(localStorage.getItem('comments')) || [];
            comments.push({ name, text: commentText });
            localStorage.setItem('comments', JSON.stringify(comments));
            loadComments();
            nameInput.value = '';
            commentInput.value = '';
        }
    }

    document.getElementById('submit-comment').addEventListener('click', submitComment);

    window.changeLanguage = changeLanguage;

    loadLanguage(currentLanguage);

    const languageSelector = document.querySelector('.language-selector select');
    if (languageSelector) languageSelector.value = currentLanguage;

    const isArticlePage = document.getElementById('article-title');
    if (isArticlePage) {
        loadArticleContent();
        loadComments();
    }
});
