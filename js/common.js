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

    // --- 3. スクリーンショット ギャラリーの初期化 ---
    initGallery();

    // --- 4. Pro版プランへのスムーズスクロール初期化 ---
    initProPlansScroll();
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

// ==========================================
// 共通スクリーンショット ギャラリー機能
// ==========================================
let galleryItems = [];
let currentGalleryIdx = 0;
let galleryModalInstance = null;

function initGallery() {
    const modalEl = document.getElementById('imageModal');
    if (!modalEl) return;

    // ページ内のすべてのスクリーンショットコンテナを取得
    const containers = document.querySelectorAll('.screenshot-container');
    if (containers.length === 0) return;

    galleryItems = [];
    containers.forEach((container, idx) => {
        const img = container.querySelector('img');
        const src = img ? img.getAttribute('src') : '';
        const parentCol = container.closest('[class*="col-"]') || container.parentElement;
        const descBlock = parentCol ? parentCol.querySelector('.screenshot-description') : null;

        const titleEl = descBlock ? descBlock.querySelector('h4, h5, h6') : null;
        const descEl = descBlock ? descBlock.querySelector('p') : null;

        const title = titleEl ? titleEl.textContent.trim() : (img ? img.alt : '');
        const desc = descEl ? descEl.textContent.trim() : '';

        galleryItems.push({ src, title, desc });

        // クリックでギャラリーを開く
        container.style.cursor = 'pointer';
        container.addEventListener('click', function () {
            openGallery(idx);
        });
    });

    // モーダル内に前へ・次へボタンがなければ自動追加
    const modalBody = modalEl.querySelector('.modal-body');
    if (modalBody && galleryItems.length > 1 && !modalBody.querySelector('.gallery-nav-btn')) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'gallery-nav-btn prev-btn';
        prevBtn.setAttribute('aria-label', 'Previous image');
        prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevBtn.onclick = function (e) {
            e.stopPropagation();
            galleryNav(-1);
        };

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'gallery-nav-btn next-btn';
        nextBtn.setAttribute('aria-label', 'Next image');
        nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextBtn.onclick = function (e) {
            e.stopPropagation();
            galleryNav(1);
        };

        modalBody.appendChild(prevBtn);
        modalBody.appendChild(nextBtn);
    }

    // キーボードの矢印キーで前後の画像へ移動
    document.addEventListener('keydown', function (e) {
        if (modalEl.classList.contains('show') && galleryItems.length > 1) {
            if (e.key === 'ArrowLeft') {
                galleryNav(-1);
            } else if (e.key === 'ArrowRight') {
                galleryNav(1);
            }
        }
    });
}

function updateGalleryView() {
    if (galleryItems.length === 0) return;
    const item = galleryItems[currentGalleryIdx];
    const modalImg = document.getElementById('modalImage');
    if (modalImg) {
        modalImg.src = item.src;
    }

    const titleEl = document.getElementById('galleryTitle');
    if (titleEl) {
        titleEl.textContent = item.title;
    }

    const counterEl = document.getElementById('galleryCounter');
    if (counterEl) {
        counterEl.textContent = `${currentGalleryIdx + 1} / ${galleryItems.length}`;
    }

    const descEl = document.getElementById('galleryDesc');
    if (descEl) {
        descEl.textContent = item.desc;
    }
}

function openGallery(idx) {
    if (idx >= 0 && idx < galleryItems.length) {
        currentGalleryIdx = idx;
    }
    updateGalleryView();

    const modalEl = document.getElementById('imageModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance ? bootstrap.Modal.getOrCreateInstance(modalEl) : (galleryModalInstance || (galleryModalInstance = new bootstrap.Modal(modalEl)));
        if (modal) {
            modal.show();
        }
    }
}

function galleryNav(direction) {
    if (galleryItems.length === 0) return;
    currentGalleryIdx = (currentGalleryIdx + direction + galleryItems.length) % galleryItems.length;
    updateGalleryView();
}

// 従来の showImage(src) との互換性維持
function showImage(src) {
    const idx = galleryItems.findIndex(item => item.src === src);
    if (idx !== -1) {
        openGallery(idx);
    } else {
        const modalImg = document.getElementById('modalImage');
        if (modalImg) {
            modalImg.src = src;
        }
    }
}

// ==========================================
// 共通 Pro版プランへのスムーズスクロール
// ==========================================
function initProPlansScroll() {
    const proPlans = document.getElementById('pro-plans');
    if (!proPlans) return;

    function scrollToProPlans(e) {
        if (e) e.preventDefault();
        const sidebar = document.querySelector('.sticky-sidebar');

        if (window.innerWidth >= 992 && sidebar) {
            sidebar.scrollTo({
                top: proPlans.offsetTop,
                behavior: 'smooth'
            });
        } else {
            proPlans.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        proPlans.classList.remove('plan-highlight');
        void proPlans.offsetWidth;
        proPlans.classList.add('plan-highlight');
    }

    document.querySelectorAll('a[href="#pro-plans"]').forEach(anchor => {
        anchor.addEventListener('click', scrollToProPlans);
    });

    if (window.location.hash === '#pro-plans') {
        setTimeout(scrollToProPlans, 200);
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

// グローバルスコープへの明示的な登録（HTMLのインライン onclick からの確実な呼び出しを担保）
window.openGallery = openGallery;
window.galleryNav = galleryNav;
window.showImage = showImage;
window.copyToClipboard = copyToClipboard;