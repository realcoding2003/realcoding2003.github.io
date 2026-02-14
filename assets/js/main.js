// Main JavaScript functionality for the blog

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initThemeToggle();
    initScrollToTop();
    initSmoothScrolling();
    initImageModal();
    initResponsiveTables();
    initCodeCopyButtons();
    if (document.querySelector('.post-content')) {
        initReadingProgress();
    }
});

// Mobile menu functionality
function initMobileMenu() {
    var mobileToggle = document.querySelector('.mobile-menu-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            var lines = mobileToggle.querySelectorAll('.hamburger-line');
            if (mainNav.classList.contains('active')) {
                lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                lines[1].style.opacity = '0';
                lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                lines[0].style.transform = '';
                lines[1].style.opacity = '';
                lines[2].style.transform = '';
            }
        });

        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target)) {
                mainNav.classList.remove('active');
                var lines = mobileToggle.querySelectorAll('.hamburger-line');
                lines[0].style.transform = '';
                lines[1].style.opacity = '';
                lines[2].style.transform = '';
            }
        });
    }
}

// Theme toggle functionality
function initThemeToggle() {
    var themeToggle = document.getElementById('themeToggle');
    var currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
    }
}

// Scroll to top functionality
function initScrollToTop() {
    var scrollBtn = document.createElement('button');
    scrollBtn.textContent = '↑';
    scrollBtn.className = 'scroll-to-top';
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', function() {
        scrollBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
    });

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                var header = document.querySelector('.site-header');
                var headerHeight = header ? header.offsetHeight : 0;
                window.scrollTo({
                    top: target.offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Reading progress bar for posts
function initReadingProgress() {
    var progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        var article = document.querySelector('.post-content');
        if (article) {
            var articleTop = article.offsetTop;
            var articleHeight = article.offsetHeight;
            var windowHeight = window.innerHeight;
            var scrollTop = window.pageYOffset;
            var progress = Math.min(
                Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
                1
            );
            progressBar.style.width = (progress * 100) + '%';
        }
    });
}

// Responsive tables
function initResponsiveTables() {
    var tables = document.querySelectorAll('.post-content table, .page-content table');
    tables.forEach(function(table) {
        if (!table.parentElement.classList.contains('table-wrapper')) {
            var wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

// Code copy buttons
function initCodeCopyButtons() {
    document.querySelectorAll('pre code').forEach(function(codeBlock) {
        var pre = codeBlock.parentNode;
        var copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.textContent = 'Copy';

        pre.style.position = 'relative';
        pre.appendChild(copyBtn);

        pre.addEventListener('mouseenter', function() { copyBtn.style.opacity = '1'; });
        pre.addEventListener('mouseleave', function() { copyBtn.style.opacity = '0'; });

        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(codeBlock.textContent).then(function() {
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                setTimeout(function() {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });
    });
}

// Image Modal with zoom/pan
function initImageModal() {
    var dialog = document.createElement('dialog');
    dialog.className = 'image-modal-dialog';
    dialog.innerHTML =
        '<div class="modal-controls">' +
            '<button class="modal-btn" data-action="zoom-in" title="Zoom In">+</button>' +
            '<button class="modal-btn" data-action="zoom-out" title="Zoom Out">−</button>' +
            '<button class="modal-btn" data-action="reset" title="Reset">↺</button>' +
            '<button class="modal-btn" data-action="close" title="Close">✕</button>' +
        '</div>' +
        '<div class="modal-viewport"><div class="modal-content"></div></div>';
    document.body.appendChild(dialog);

    var viewport = dialog.querySelector('.modal-viewport');
    var content = dialog.querySelector('.modal-content');
    var scale = 1;
    var translateX = 0, translateY = 0;
    var isDragging = false, startX, startY;

    function updateTransform() {
        content.style.transform = 'translate(' + translateX + 'px,' + translateY + 'px) scale(' + scale + ')';
    }

    function resetView() {
        scale = 1; translateX = 0; translateY = 0;
        updateTransform();
    }

    function openModal(element) {
        content.innerHTML = '';
        content.appendChild(element);
        resetView();
        dialog.showModal();
    }

    // Controls
    dialog.addEventListener('click', function(e) {
        var action = e.target.dataset.action;
        if (action === 'zoom-in') { scale = Math.min(scale * 1.3, 5); updateTransform(); }
        else if (action === 'zoom-out') { scale = Math.max(scale / 1.3, 0.3); updateTransform(); }
        else if (action === 'reset') { resetView(); }
        else if (action === 'close') { dialog.close(); }
        else if (e.target === dialog || e.target === viewport) { dialog.close(); }
    });

    // Mouse wheel zoom
    viewport.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.min(Math.max(scale * delta, 0.3), 5);
        updateTransform();
    }, { passive: false });

    // Drag to pan
    viewport.addEventListener('mousedown', function(e) {
        if (e.target === viewport || content.contains(e.target)) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            viewport.style.cursor = 'grabbing';
        }
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });
    document.addEventListener('mouseup', function() {
        isDragging = false;
        viewport.style.cursor = '';
    });

    // Touch drag
    viewport.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    }, { passive: true });
    viewport.addEventListener('touchmove', function(e) {
        if (!isDragging || e.touches.length !== 1) return;
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        updateTransform();
    }, { passive: true });
    viewport.addEventListener('touchend', function() { isDragging = false; });

    // Keyboard
    dialog.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { dialog.close(); }
        else if (e.key === '+' || e.key === '=') { scale = Math.min(scale * 1.3, 5); updateTransform(); }
        else if (e.key === '-') { scale = Math.max(scale / 1.3, 0.3); updateTransform(); }
        else if (e.key === '0') { resetView(); }
    });

    function attachImageListeners() {
        // Regular images
        var images = document.querySelectorAll('.post-content img, .page-content img');
        images.forEach(function(img) {
            if (img.dataset.modalReady) return;
            img.dataset.modalReady = 'true';
            img.style.cursor = 'zoom-in';

            img.addEventListener('click', function(e) {
                e.preventDefault();
                var el = document.createElement('img');
                el.src = img.src;
                el.alt = img.alt || 'Enlarged image';
                openModal(el);
            });
        });

        // Mermaid diagrams
        var mermaidDiagrams = document.querySelectorAll(
            '.post-content .mermaid svg, .page-content .mermaid svg'
        );
        mermaidDiagrams.forEach(function(svg) {
            var container = svg.parentElement;
            if (container.dataset.modalReady) return;
            container.dataset.modalReady = 'true';
            container.style.cursor = 'zoom-in';

            container.addEventListener('click', function(e) {
                e.preventDefault();
                var svgClone = svg.cloneNode(true);
                if (!svgClone.getAttribute('viewBox')) {
                    var w = svg.getAttribute('width') || svg.getBoundingClientRect().width;
                    var h = svg.getAttribute('height') || svg.getBoundingClientRect().height;
                    svgClone.setAttribute('viewBox', '0 0 ' + parseFloat(w) + ' ' + parseFloat(h));
                }
                svgClone.removeAttribute('width');
                svgClone.removeAttribute('height');
                svgClone.removeAttribute('style');
                openModal(svgClone);
            });
        });
    }

    attachImageListeners();
    var observer = new MutationObserver(function() { attachImageListeners(); });
    observer.observe(document.body, { childList: true, subtree: true });
}
