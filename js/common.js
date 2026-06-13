document.addEventListener("DOMContentLoaded", function () {
    // --- 1. ヘッダーの読み込み ---
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('/header.html')
            .then(response => {
                if (!response.ok) throw new Error('Header not found');
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
                initLangSwitch(); // 言語スイッチの初期化
            })
            .catch(error => console.error('Error loading header:', error));
    }

    // --- 2. フッターの読み込み ---
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('/footer.html')
            .then(response => {
                if (!response.ok) throw new Error('Footer not found');
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
                // フッターが読み込まれた後に年号を更新する
                updateYear();
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});

// --- ヘッダーのリンクを英語対応にする ---
function initLangSwitch() {
    const langBtn = document.getElementById('lang-switch');
    if (!langBtn) return;

    const path = window.location.pathname;
    const isEnglish = path.includes('/en/');

    langBtn.innerHTML = isEnglish ? '<i class="bi bi-globe me-1"></i>JP' : '<i class="bi bi-globe me-1"></i>EN';

    // 英語版にいるなら、ナビメニューとロゴの両方を英語版へ飛ばす
    if (isEnglish) {
        // セレクタに a.navbar-brand を追加
        document.querySelectorAll('#header-placeholder a.nav-link, #header-placeholder a.navbar-brand').forEach(link => {
            if (link.id === 'lang-switch') return;
            const originalHref = link.getAttribute('href');
            if (originalHref && !originalHref.startsWith('/en/')) {
                link.href = '/en' + originalHref;
            }
        });

        const copyTextElement = document.getElementById('copy-link-text');
        if (copyTextElement) {
            copyTextElement.textContent = "Copy URL";
        }
    }

    langBtn.addEventListener('click', function (e) {
        e.preventDefault();
        let targetPath = isEnglish ? path.replace('/en/', '/') : (path === '/' || path.endsWith('index.html') ? '/en/index.html' : '/en' + path);
        window.location.href = targetPath.replace('//', '/');
    });

    const currentUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title); // ページタイトルも取得

    // X (Twitter) のリンクを更新
    const shareX = document.getElementById('share-x');
    if (shareX) {
        shareX.href = `https://x.com/intent/tweet?url=${currentUrl}&text=${pageTitle}`;
    }

    // LINE のリンクを更新
    const shareLine = document.getElementById('share-line');
    if (shareLine) {
        shareLine.href = `https://social-plugins.line.me/lineit/share?url=${currentUrl}`;
    }

    // Facebook のリンクを更新
    const shareFB = document.getElementById('share-fb');
    if (shareFB) {
        shareFB.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    }
}

// --- フッターの文字とリンクを英語対応にする ---
function updateYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const path = window.location.pathname;
    if (path.includes('/en/')) {
        // テキストの翻訳
        const links = {
            'f-terms': 'Terms of Service',
            'f-privacy': 'Privacy Policy',
            'f-law': 'Commercial Disclosure',
            'f-contact': 'Contact'
        };

        for (const [id, text] of Object.entries(links)) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = text;
                // リンク先も /en/ 版へ書き換え
                const originalHref = el.getAttribute('href');
                if (originalHref && !originalHref.startsWith('/en/')) {
                    el.href = '/en' + originalHref;
                }
            }
        }
    }
}

// --- 画像表示用（モーダル操作） ---
function showImage(src) {
    const modalImg = document.getElementById('modalImage');
    if (modalImg) {
        modalImg.src = src;
    }
}

function copyToClipboard() {
    // 現在のページのURLを取得
    const url = window.location.href;

    // パスに "/en/" が含まれているかチェック
    const isEnglish = window.location.pathname.includes('/en/');

    // メッセージの切り替え
    const message = isEnglish
        ? "URL copied to clipboard!"
        : "URLをコピーしました！";

    // クリップボードへのコピー処理
    navigator.clipboard.writeText(url).then(() => {
        alert(message);
    }).catch(err => {
        console.error('Copy failed', err);
    });
}