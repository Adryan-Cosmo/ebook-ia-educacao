// app.js — interatividade avançada (tema, menu, progresso, quiz, checklist, tooltips, modos de visão)let isDark = false;let sectionsList = [];
let activeSectionIndex = 0;
// Índice máximo desbloqueado (inicial: capa e introdução = 0 e 1)
let unlockedUntilIndex = 1;
// Controle de capítulos efetivamente lidos
let readChapters = new Set();
// Modo de progresso exibido na barra interna: 'unlock' (desbloqueio) ou 'chapter' (interno—placeholder 100%)
let progressMode = 'unlock';
// Visão completa (todas as seções) vs visão linear (um capítulo por vez)
let fullView = false;
// Pontuação acumulada do quiz prático
let quizPraticoScore = { correct: 0, total: 0 };
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const progressBar = document.getElementById('progressBar');
const navLinks = document.querySelectorAll('.nav-link');
const chapterTitleEl = document.getElementById('currentChapterTitle');
const chapterPositionEl = document.getElementById('chapterPosition');
const chapterPercentEl = document.getElementById('chapterPercent');
const chapterProgressFill = document.getElementById('chapterNavProgress');
const prevChapterBtn = document.getElementById('prevChapter');
const nextChapterBtn = document.getElementById('nextChapter');
const printButton = document.getElementById('printButton');
const startJourneyBtn = document.getElementById('startJourney');
// Novos controles
const viewModeToggle = document.getElementById('viewModeToggle');
const progressModeToggle = document.getElementById('progressModeToggle');
// Quiz prático score elements
const quizPraticoScoreBox = document.getElementById('quizPraticoScore');
const quizPraticoAcertosEl = document.getElementById('quizPraticoAcertos');
const quizPraticoTotalEl = document.getElementById('quizPraticoTotal');
const quizPraticoPercentEl = document.getElementById('quizPraticoPercent');
const quizPraticoFill = document.getElementById('quizPraticoFill');
const resetQuizPraticoBtn = document.getElementById('resetQuizPratico');

function init() {
    setupTheme();
    setupSidebar();
    setupProgressBar();
    setupChapterNavigation(); // define capítulos e active antes
    setupNavigation(); // apenas links
    setupSmoothScroll();
    setupQuiz();
    setupQuizPraticoScore();
    setupChecklist();
    setupTooltips();
    setupPrintButton();
    setupViewAndProgressMode();
    setupCitationCopy();
}

function setupCitationCopy() {
    const citationCode = document.getElementById('citationText');
    if (!citationCode) return;
    // Atualiza dinamicamente o ano e versão se placeholders JS estiverem literais
    const versionMeta = document.querySelector('meta[name="ebook:version"]');
    const authorMeta = document.querySelector('meta[name="ebook:author"]');
    const year = new Date().getFullYear();
    if (citationCode.textContent.includes('${new Date().getFullYear()}')) {
        const current = citationCode.textContent;
        citationCode.textContent = current
            .replace('${new Date().getFullYear()}', year)
            .replace(
                '${document.querySelector(\'meta[name="ebook:version"]\')?.content||"1.0.0"}',
                versionMeta ? versionMeta.content : '1.0.0'
            )
            .replace(
                '${document.querySelector(\'meta[name="ebook:author"]\')?.content||"Autor"}',
                authorMeta ? authorMeta.content : 'Autor'
            );
    }
    const buttons = [
        document.getElementById('copyCitation'),
        document.getElementById('copyCitationFooter'),
    ].filter(Boolean);
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            copyTextToClipboard(citationCode.textContent.trim(), btn);
        });
    });
}

function copyTextToClipboard(text, btn) {
    if (!navigator.clipboard) {
        fallbackCopy(text, btn);
        return;
    }
    navigator.clipboard
        .writeText(text)
        .then(() => flashCopied(btn))
        .catch(() => fallbackCopy(text, btn));
}

function fallbackCopy(text, btn) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(textarea);
    flashCopied(btn);
}

function flashCopied(btn) {
    if (!btn) return;
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Copiado!';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.classList.remove('copied');
    }, 1600);
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function setupTheme() {
    const root = document.documentElement;
    try {
        const saved = localStorage.getItem('ebook-theme');
        if (saved) {
            root.setAttribute('data-theme', saved);
            isDark = saved === 'dark';
        } else {
            isDark = root.getAttribute('data-theme') === 'dark';
        }
    } catch (_) {
        isDark = root.getAttribute('data-theme') === 'dark';
    }
    updateThemeIcon();
    themeToggle?.addEventListener('click', () => {
        isDark = !isDark;
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
        try {
            localStorage.setItem('ebook-theme', isDark ? 'dark' : 'light');
        } catch (_) {}
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    if (!themeIcon) return;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const dark = currentTheme === 'dark';
    themeIcon.textContent = dark ? '☀️' : '🌙';
}

function setupSidebar() {
    mobileMenuBtn.addEventListener('click', () =>
        sidebar.classList.toggle('open')
    );
    sidebarToggle.addEventListener('click', () =>
        sidebar.classList.remove('open')
    );
    document.addEventListener('click', (event) => {
        if (
            !sidebar.contains(event.target) &&
            !mobileMenuBtn.contains(event.target)
        ) {
            sidebar.classList.remove('open');
        }
    });
}

function setupProgressBar() {
    // Agora refletirá progresso de capítulos desbloqueados (atualizado externamente)
}

function setupNavigation() {
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('[data-scroll]').forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-scroll');
            document
                .querySelector(target)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function setupQuiz() {
    document.querySelectorAll('.quiz-options').forEach((group) => {
        const feedback = document.getElementById(
            group.dataset.quiz + '-feedback'
        );
        let answered = false;
        const options = Array.from(group.querySelectorAll('.option'));
        // Animação de entrada escalonada
        options.forEach((o, idx) => {
            requestAnimationFrame(() =>
                setTimeout(() => o.classList.add('appear'), idx * 70)
            );
        });

        options.forEach((btn) => {
            btn.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                const correctBtn = options.find((o) =>
                    o.hasAttribute('data-correct')
                );
                const isCorrect = btn === correctBtn;
                options.forEach((o) => {
                    if (o === correctBtn) o.classList.add('is-correct');
                    else if (o === btn)
                        o.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
                    else o.classList.add('is-neutral');
                    o.disabled = true;
                });
                if (feedback) {
                    feedback.textContent = isCorrect
                        ? '✅ Correto! Excelente compreensão.'
                        : '❌ Resposta incorreta. Reveja o conceito e tente aplicar novamente.';
                    feedback.className =
                        'quiz-feedback ' + (isCorrect ? 'ok' : 'err');
                }
                // Atualiza score acumulado se for quiz prático (prefixo p)
                if (group.dataset.quiz?.startsWith('p')) {
                    registerQuizPraticoAnswer(isCorrect);
                }
            });
        });
    });
}

function setupQuizPraticoScore() {
    if (!quizPraticoScoreBox) return;
    const total = document.querySelectorAll(
        '.quiz-options[data-quiz^="p"]'
    ).length;
    quizPraticoScore.total = total;
    if (quizPraticoTotalEl) quizPraticoTotalEl.textContent = String(total);
    try {
        const saved = JSON.parse(
            localStorage.getItem('ebook-quiz-pratico') || 'null'
        );
        if (saved && typeof saved.correct === 'number')
            quizPraticoScore.correct = saved.correct;
    } catch (_) {}
    updateQuizPraticoUI();
    resetQuizPraticoBtn?.addEventListener('click', resetQuizPratico);
}

function registerQuizPraticoAnswer(isCorrect) {
    if (isCorrect) quizPraticoScore.correct += 1;
    persistQuizPratico();
    updateQuizPraticoUI();
}
function persistQuizPratico() {
    try {
        localStorage.setItem(
            'ebook-quiz-pratico',
            JSON.stringify(quizPraticoScore)
        );
    } catch (_) {}
}
function resetQuizPratico() {
    quizPraticoScore.correct = 0;
    persistQuizPratico();
    document
        .querySelectorAll('.quiz-options[data-quiz^="p"]')
        .forEach((group) => {
            const feedback = document.getElementById(
                group.dataset.quiz + '-feedback'
            );
            if (feedback) {
                feedback.textContent = '';
                feedback.className = 'quiz-feedback';
            }
            group.querySelectorAll('.option').forEach((btn) => {
                btn.classList.remove('is-correct', 'is-wrong', 'is-neutral');
                btn.disabled = false;
                btn.classList.remove('appear');
                setTimeout(() => btn.classList.add('appear'), 10);
            });
        });
    // Recria listeners reinvocando setupQuiz só para grupos p*
    setupQuiz();
    updateQuizPraticoUI();
}
function updateQuizPraticoUI() {
    if (!quizPraticoScoreBox) return;
    const { correct, total } = quizPraticoScore;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    if (quizPraticoAcertosEl)
        quizPraticoAcertosEl.textContent = String(correct);
    if (quizPraticoPercentEl) quizPraticoPercentEl.textContent = percent + '%';
    if (quizPraticoFill) quizPraticoFill.style.width = percent + '%';
    quizPraticoScoreBox.hidden = false;
}

function setupChecklist() {
    const list = document.getElementById('checklist');
    const clearBtn = document.getElementById('clearChecklist');
    if (!list) return;

    const key = 'ebook-checklist';
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    const checkboxes = list.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = !!saved[index];
    });

    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => {
            const state = Array.from(checkboxes).map((cb) => cb.checked);
            localStorage.setItem(key, JSON.stringify(state));
        });
    });

    clearBtn?.addEventListener('click', () => {
        checkboxes.forEach((checkbox) => (checkbox.checked = false));
        localStorage.setItem(
            key,
            JSON.stringify(Array(checkboxes.length).fill(false))
        );
    });
}

function setupTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach((element) => {
        element.addEventListener('mouseenter', () => {
            const tip = document.createElement('div');
            tip.className = 'tooltip';
            tip.textContent = element.getAttribute('data-tooltip');
            document.body.appendChild(tip);
            const rect = element.getBoundingClientRect();
            tip.style.left = rect.left + rect.width / 2 + 'px';
            tip.style.top = rect.top - 8 + window.scrollY + 'px';
            requestAnimationFrame(() => tip.classList.add('show'));
            element._tip = tip;
        });

        element.addEventListener('mouseleave', () => {
            if (element._tip) {
                element._tip.remove();
                element._tip = null;
            }
        });
    });
}

function getSectionLabel(section) {
    if (!section) return '';
    return (
        section.dataset.title ||
        section.querySelector('h2')?.textContent?.trim() ||
        section.id ||
        'Capítulo'
    );
}

function setupChapterNavigation() {
    sectionsList = Array.from(document.querySelectorAll('.section'));
    if (!sectionsList.length) return;
    document.documentElement.classList.add('chapters-mode');
    const total = sectionsList.length;

    // Restaura progresso salvo (qual capítulo já foi desbloqueado)
    const savedUnlock = parseInt(
        localStorage.getItem('ebook-unlocked-until') || '1',
        10
    );
    if (!isNaN(savedUnlock)) {
        unlockedUntilIndex = Math.min(savedUnlock, total - 1);
    }

    const refreshLocks = () => {
        navLinks.forEach((link) => {
            const hash = link.getAttribute('href');
            if (!hash || !hash.startsWith('#')) return;
            const targetId = hash.slice(1);
            const idx = sectionsList.findIndex((s) => s.id === targetId);
            if (idx === -1) return;
            if (idx <= unlockedUntilIndex) link.classList.remove('locked');
            else link.classList.add('locked');
        });
    };

    const persistUnlock = () => {
        localStorage.setItem(
            'ebook-unlocked-until',
            String(unlockedUntilIndex)
        );
    };

    const maybeUnlockNext = () => {
        // Desbloqueia apenas o próximo capítulo imediato (progressão linear)
        if (
            activeSectionIndex >= unlockedUntilIndex &&
            unlockedUntilIndex < total - 1
        ) {
            unlockedUntilIndex = activeSectionIndex + 1; // libera somente o próximo
            persistUnlock();
            refreshLocks();
        }
    };

    const applyActive = () => {
        sectionsList.forEach((sec, idx) => {
            if (idx === activeSectionIndex) sec.classList.add('active');
            else sec.classList.remove('active');
        });
    };

    const updateProgressBarChapters = () => {
        // Progresso baseado em capítulos desbloqueados (0..1)
        const ratio = (unlockedUntilIndex + 1) / total;
        progressBar.style.width = ratio * 100 + '%';
    };

    const updateChapterUI = (index) => {
        activeSectionIndex = Math.max(0, Math.min(total - 1, index));
        const section = sectionsList[activeSectionIndex];
        const label = getSectionLabel(section);
        // Marca como lido
        readChapters.add(section.id);
        persistReadChapters();
        refreshReadStates();
        if (chapterTitleEl) chapterTitleEl.textContent = label;
        if (chapterPositionEl)
            chapterPositionEl.textContent = `${
                activeSectionIndex + 1
            } / ${total}`;
        updateChapterInternalProgress();
        if (prevChapterBtn) prevChapterBtn.disabled = activeSectionIndex === 0;
        if (nextChapterBtn)
            nextChapterBtn.disabled = activeSectionIndex === total - 1;
        document.body.setAttribute('data-active-section', section?.id || '');
        applyActive();
        maybeUnlockNext();
        updateProgressBarChapters();
    };

    const goTo = (targetIndex) => {
        updateChapterUI(targetIndex);
        // Força reflow para garantir ocultação antes de rolar
        void document.body.offsetHeight;
        window.scrollTo({ top: 0, behavior: 'auto' });
        const currentId = sectionsList[activeSectionIndex].id;
        navLinks.forEach((l) => {
            l.classList.toggle(
                'active',
                l.getAttribute('href') === '#' + currentId
            );
        });
    };

    prevChapterBtn?.addEventListener('click', () => {
        if (activeSectionIndex > 0) goTo(activeSectionIndex - 1);
    });
    nextChapterBtn?.addEventListener('click', () => {
        if (activeSectionIndex < total - 1) {
            // Se o próximo ainda está bloqueado mas é o próximo sequencial, libera-o
            if (activeSectionIndex + 1 === unlockedUntilIndex + 1) {
                unlockedUntilIndex = activeSectionIndex + 1;
                persistUnlock();
                refreshLocks();
            }
            goTo(activeSectionIndex + 1);
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (!hash || !hash.startsWith('#')) return;
            const target = hash.slice(1);
            const idx = sectionsList.findIndex((s) => s.id === target);
            if (idx !== -1) {
                // Bloqueia se ainda não desbloqueado
                if (idx > unlockedUntilIndex) {
                    e.preventDefault();
                    link.classList.add('locked-pulse');
                    setTimeout(
                        () => link.classList.remove('locked-pulse'),
                        600
                    );
                    return;
                }
                e.preventDefault();
                goTo(idx, true);
            }
        });
    });
    refreshLocks();
    // Garante que a capa esteja ativa ao iniciar
    updateChapterUI(Math.min(activeSectionIndex, unlockedUntilIndex));

    // Botão da capa para avançar diretamente à Introdução
    startJourneyBtn?.addEventListener('click', () => {
        const introIndex = sectionsList.findIndex((s) => s.id === 'introducao');
        if (introIndex !== -1) {
            // Garante desbloqueio da introdução (já deve estar) e vai para ela
            if (introIndex > unlockedUntilIndex) {
                unlockedUntilIndex = introIndex;
                persistUnlock();
                refreshLocks();
            }
            goTo(introIndex);
        }
    });
}

// Persistência de capítulos lidos
function persistReadChapters() {
    try {
        localStorage.setItem(
            'ebook-read-chapters',
            JSON.stringify(Array.from(readChapters))
        );
    } catch (_) {}
}
function loadReadChapters() {
    try {
        const saved = JSON.parse(
            localStorage.getItem('ebook-read-chapters') || '[]'
        );
        if (Array.isArray(saved)) saved.forEach((id) => readChapters.add(id));
    } catch (_) {}
}
function refreshReadStates() {
    navLinks.forEach((link) => {
        const hash = link.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return;
        const id = hash.slice(1);
        link.classList.remove('read', 'unlocked-only');
        const idx = sectionsList.findIndex((s) => s.id === id);
        if (idx === -1) return;
        if (idx <= unlockedUntilIndex) {
            if (readChapters.has(id)) link.classList.add('read');
            else link.classList.add('unlocked-only');
        }
    });
}

function setupViewAndProgressMode() {
    loadReadChapters();
    refreshReadStates();
    viewModeToggle?.addEventListener('click', () => {
        fullView = !fullView;
        document.documentElement.classList.toggle('full-view', fullView);
        viewModeToggle.textContent = fullView
            ? 'Visão Linear'
            : 'Visão Completa';
    });
    progressModeToggle?.addEventListener('click', () => {
        progressMode = progressMode === 'unlock' ? 'chapter' : 'unlock';
        progressModeToggle.textContent =
            'Progresso: ' +
            (progressMode === 'unlock' ? 'Desbloqueio' : 'Capítulo');
        updateChapterInternalProgress();
    });
}

function updateChapterInternalProgress() {
    if (!chapterPercentEl || !chapterProgressFill) return;
    if (progressMode === 'unlock') {
        const total = sectionsList.length || 1;
        const percent = Math.round(((unlockedUntilIndex + 1) / total) * 100);
        chapterPercentEl.textContent = percent + '%';
        chapterProgressFill.style.width = percent + '%';
    } else {
        // Placeholder: 100% (poderá futuramente calcular pelo scroll interno do capítulo)
        chapterPercentEl.textContent = '100%';
        chapterProgressFill.style.width = '100%';
    }
}

function setupPrintButton() {
    if (!printButton) return;
    const clearPrintTargets = () =>
        sectionsList.forEach((section) =>
            section.classList.remove('print-target')
        );

    window.addEventListener('afterprint', clearPrintTargets);

    printButton.addEventListener('click', () => {
        if (!sectionsList.length) {
            window.print();
            return;
        }
        const targetSection =
            sectionsList[activeSectionIndex] || sectionsList[0];
        if (!targetSection) {
            window.print();
            return;
        }
        clearPrintTargets();
        targetSection.classList.add('print-target');
        window.print();
    });
}

const style = document.createElement('style');
style.innerHTML = `
.tooltip{position:absolute;transform:translate(-50%,-100%);background:rgba(17,24,39,.9);color:#fff;padding:6px 8px;border-radius:6px;font-size:12px;opacity:0;transition:opacity .15s ease;pointer-events:none;z-index:1200}
.tooltip.show{opacity:1}
.quiz-feedback{margin-top:8px;font-weight:600}
.quiz-feedback.ok{color:#16a34a}
.quiz-feedback.err{color:#ef4444}
`;
document.head.appendChild(style);
