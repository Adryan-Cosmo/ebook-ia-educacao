// app.js — trilha formativa v2: caderno, exercícios, checklists, quiz,
// progresso, busca, tema, backup e exportação.
//
// Todo o estado vive em `state` e é espelhado em localStorage (prefixo
// "ebook2."). A interface é sempre derivada do estado em render(): nada de
// escrever rótulos ou contadores direto no DOM fora dali.
(function () {
  'use strict';

  var PREFIX = 'ebook2.';
  var APP_ID = 'trilha-ia-educacao';

  var MOD_IDS = ['modulo-0', 'modulo-1', 'modulo-2', 'modulo-3', 'modulo-4', 'modulo-5', 'modulo-6'];

  var NOTE_IDS = ['caderno-mod0', 'ex-mod1', 'caderno-mod1', 'caderno-mod2', 'caderno-mod3', 'ex-mod4', 'caderno-mod4', 'caderno-mod5', 'caderno-mod6'];

  var NOTE_TITLES = {
    'caderno-mod0': 'Módulo 0 — Fundamentos',
    'ex-mod1': 'Módulo 1 — Exercício de prompt',
    'caderno-mod1': 'Módulo 1 — Caderno',
    'caderno-mod2': 'Módulo 2 — Caderno',
    'caderno-mod3': 'Módulo 3 — Caderno',
    'ex-mod4': 'Módulo 4 — Sequência didática',
    'caderno-mod4': 'Módulo 4 — Caderno',
    'caderno-mod5': 'Módulo 5 — Caderno',
    'caderno-mod6': 'Módulo 6 — Caderno'
  };

  var SECTIONS = [
    ['modulo-0', 'Módulo 0 — Fundamentos'],
    ['modulo-1', 'Módulo 1 — Engenharia de Prompts'],
    ['modulo-2', 'Módulo 2 — Ferramentas de IA'],
    ['modulo-3', 'Módulo 3 — Ferramentas Complementares'],
    ['modulo-4', 'Módulo 4 — Aplicação Pedagógica'],
    ['modulo-5', 'Módulo 5 — Ética, LGPD e Direitos'],
    ['modulo-6', 'Módulo 6 — Trilha de Implementação'],
    ['glossario', 'Glossário'],
    ['referencias', 'Referências Bibliográficas']
  ];

  var SPY_IDS = ['trilha'].concat(SECTIONS.map(function (s) { return s[0]; }));

  var BACKUP_KEYS = ['lgpd', 'impl', 'quiz', 'done', 'certName', 'doneAt', 'lastSection'];

  var FLAG_KEYS = ['p1', 'p2', 'p3'];

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');

  // ---------------------------------------------------------------------------
  // Persistência. Chaves de estado vão em JSON; as nove áreas de texto e o
  // tema vão crus. Manter essa simetria também na restauração de backup.
  // ---------------------------------------------------------------------------

  var store = {
    get: function (key) {
      try {
        var v = localStorage.getItem(PREFIX + key);
        return v == null ? null : JSON.parse(v);
      } catch (e) { return null; }
    },
    set: function (key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    getRaw: function (key) {
      try { return localStorage.getItem(PREFIX + key); } catch (e) { return null; }
    },
    setRaw: function (key, value) {
      try { localStorage.setItem(PREFIX + key, value); return true; } catch (e) { return false; }
    },
    probe: function () {
      try {
        localStorage.setItem(PREFIX + '__probe', '1');
        localStorage.removeItem(PREFIX + '__probe');
        return true;
      } catch (e) { return false; }
    }
  };

  function asMap(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function asString(v) { return typeof v === 'string' ? v : ''; }
  function knownSection(v) { return SPY_IDS.indexOf(v) >= 0 ? v : null; }

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------

  var state = {
    theme: store.getRaw('theme') === 'dark' ? 'dark' : 'light',
    storageOk: store.probe(),
    found: {},
    lgpd: asMap(store.get('lgpd')),
    impl: asMap(store.get('impl')),
    quiz: asMap(store.get('quiz')),
    done: asMap(store.get('done')),
    certName: asString(store.get('certName')),
    doneAt: asString(store.get('doneAt')) || null,
    // Seção da visita anterior: alimenta "Continuar em…" na capa.
    lastSection: knownSection(store.get('lastSection')),
    words: {},
    navOpen: false,
    searchOpen: false,
    query: '',
    sel: 0,
    popupBlocked: false,
    backupMsg: '',
    backupError: false,
    citeMsg: ''
  };

  function setState(patch) {
    for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) state[k] = patch[k];
    render();
  }

  function toggleIn(key, id) {
    var next = Object.assign({}, state[key]);
    next[id] = !next[id];
    var patch = {};
    patch[key] = next;
    return patch;
  }

  // ---------------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------------

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function byId(id) { return document.getElementById(id); }

  var el = {
    html: document.documentElement,
    themeToggle: byId('theme-toggle'),
    storageWarn: byId('storage-warn'),
    doneChip: byId('done-chip'),
    doneChipText: byId('done-chip-text'),
    sidenav: byId('sidenav'),
    navToggle: $('.snav-toggle'),
    scrim: byId('nav-scrim'),
    navLinks: $$('.snav-link[data-nav]'),
    startLabel: byId('start-label'),
    resumeLink: byId('resume-link'),
    resumeLabel: byId('resume-label'),
    progressFill: byId('progress-fill'),
    progressPct: byId('progress-pct'),
    progressTrack: byId('progress-track'),
    searchOpen: byId('search-open'),
    searchOverlay: byId('search-overlay'),
    searchInput: byId('search-input'),
    searchResults: byId('search-results'),
    searchEmpty: byId('search-empty'),
    flags: $$('.flag[data-k]'),
    foundMsg: byId('found-msg'),
    doneButtons: $$('.btn-done[data-done]'),
    checklists: $$('[data-checklist]'),
    quizItems: $$('.quiz__item'),
    quizScore: byId('quiz-score'),
    quizResetWrap: byId('quiz-reset-wrap'),
    certName: byId('cert-name'),
    percursoDate: byId('percurso-date'),
    popupWarn: byId('popup-warn'),
    backupMsg: byId('backup-msg'),
    backupFile: byId('backup-file'),
    citeMsg: byId('cite-msg'),
    srStatus: byId('sr-status')
  };

  var spies = $$('[data-spy]');

  var glossary = $$('#glossary > div').map(function (row) {
    return { id: row.id, term: $('dt', row).textContent.trim(), def: $('dd', row).textContent.trim() };
  });

  function wordsOf(v) {
    var t = (v || '').trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function announce(msg) {
    el.srStatus.textContent = '';
    // Troca em dois tempos para o leitor de tela anunciar mensagens repetidas.
    setTimeout(function () { el.srStatus.textContent = msg; }, 30);
  }

  // ---------------------------------------------------------------------------
  // Derivações
  // ---------------------------------------------------------------------------

  function doneCount() {
    return MOD_IDS.filter(function (id) { return state.done[id]; }).length;
  }

  function sectionLabel(id) {
    for (var i = 0; i < SECTIONS.length; i++) {
      if (SECTIONS[i][0] === id) return SECTIONS[i][1].split(' — ')[0];
    }
    return 'onde você parou';
  }

  function checklistItems(key) {
    var list = $('[data-checklist="' + key + '"]');
    return list ? $$('.check', list) : [];
  }

  function checkedCount(key) {
    return checklistItems(key).filter(function (_, i) { return state[key][i]; }).length;
  }

  function quizStats() {
    var answered = 0;
    var correct = 0;
    el.quizItems.forEach(function (item, qi) {
      var sel = state.quiz[qi];
      if (typeof sel !== 'number') return;
      answered++;
      if (sel === Number(item.dataset.correct)) correct++;
    });
    return { answered: answered, correct: correct, total: el.quizItems.length };
  }

  // Registra a data de conclusão na primeira vez em que os sete módulos
  // aparecem marcados.
  function ensureDoneAt() {
    if (doneCount() === MOD_IDS.length && !state.doneAt) {
      state.doneAt = new Date().toISOString();
      store.set('doneAt', state.doneAt);
    }
  }

  function doneAtLabel() {
    if (doneCount() < MOD_IDS.length || !state.doneAt) return 'percurso em andamento';
    var d = new Date(state.doneAt);
    if (isNaN(d.getTime())) return 'percurso concluído';
    return 'concluída em ' + d.toLocaleDateString('pt-BR') + ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function searchResults() {
    var q = state.query.trim().toLowerCase();
    var match = function (s) { return !q || s.toLowerCase().indexOf(q) >= 0; };
    var out = [];
    SECTIONS.forEach(function (s) {
      if (match(s[1])) out.push({ href: '#' + s[0], kind: 'Seção', title: s[1], def: '' });
    });
    glossary.forEach(function (g) {
      if (match(g.term) || match(g.def)) out.push({ href: '#' + g.id, kind: 'Termo', title: g.term, def: g.def });
    });
    return out;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  var lastResults = [];

  function render() {
    var dc = doneCount();
    var total = MOD_IDS.length;

    // Tema
    el.html.setAttribute('data-theme', state.theme);
    el.html.style.colorScheme = state.theme;
    el.themeToggle.textContent = state.theme === 'dark' ? 'Claro' : 'Escuro';
    el.themeToggle.setAttribute('aria-pressed', String(state.theme === 'dark'));

    el.storageWarn.hidden = state.storageOk;

    // Contadores de palavras
    NOTE_IDS.forEach(function (id) {
      var w = state.words[id] || 0;
      var txt = w === 0 ? '0 palavras' : plural(w, 'palavra', 'palavras') + (state.storageOk ? ' · salvo' : ' · não salvo');
      $$('[data-count-for="' + id + '"]').forEach(function (c) { c.textContent = txt; });
    });

    // Progresso por módulos
    el.doneChipText.textContent = dc + '/' + total + ' módulos';
    el.doneChip.classList.toggle('is-on', dc > 0);

    el.navLinks.forEach(function (link) {
      var id = link.getAttribute('data-nav');
      if (MOD_IDS.indexOf(id) < 0) return;
      var on = !!state.done[id];
      link.classList.toggle('done', on);
      var name = $$('span', link).map(function (s) { return s.textContent.trim(); }).join(' ');
      if (on) link.setAttribute('aria-label', name + ' — módulo concluído');
      else link.removeAttribute('aria-label');
    });

    el.doneButtons.forEach(function (btn) {
      var on = !!state.done[btn.getAttribute('data-done')];
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? '✓ Módulo concluído' : 'Marcar como concluído';
    });

    // Capa
    el.startLabel.textContent = state.lastSection ? 'Ver a trilha' : 'Começar a trilha';
    var showResume = !!state.lastSection && state.lastSection !== 'trilha';
    el.resumeLink.hidden = !showResume;
    if (showResume) {
      el.resumeLink.setAttribute('href', '#' + state.lastSection);
      el.resumeLabel.textContent = 'Continuar em ' + sectionLabel(state.lastSection);
    }

    // Menu lateral (abaixo de 1080px)
    el.sidenav.classList.toggle('open', state.navOpen);
    el.navToggle.setAttribute('aria-expanded', String(state.navOpen));
    el.scrim.hidden = !state.navOpen;

    // Exercício de alucinação
    var found = FLAG_KEYS.filter(function (k) { return state.found[k]; }).length;
    el.flags.forEach(function (f) {
      f.setAttribute('aria-pressed', String(!!state.found[f.getAttribute('data-k')]));
    });
    FLAG_KEYS.forEach(function (k) {
      var note = $('[data-flag-note="' + k + '"]');
      if (note) note.hidden = !state.found[k];
    });
    el.foundMsg.textContent = found === 0 ? '' :
      found === FLAG_KEYS.length ? 'Os três problemas identificados. Este é o olhar crítico que a trilha pede.' :
      found + ' de 3 problemas identificados';
    el.foundMsg.classList.toggle('is-complete', found === FLAG_KEYS.length);

    // Checklists
    el.checklists.forEach(function (list) {
      var key = list.getAttribute('data-checklist');
      var items = $$('.check', list);
      var n = 0;
      items.forEach(function (item, i) {
        var on = !!state[key][i];
        if (on) n++;
        item.setAttribute('aria-pressed', String(on));
        $('.check__box', item).textContent = on ? '✓' : '';
      });
      var count = $('[data-checklist-count]', list);
      count.textContent = n + ' de ' + items.length;
      count.classList.toggle('is-complete', n === items.length);
    });

    // Quiz
    var qs = quizStats();
    el.quizItems.forEach(function (item, qi) {
      var sel = state.quiz[qi];
      var answered = typeof sel === 'number';
      var correct = Number(item.dataset.correct);
      $$('.opt', item).forEach(function (opt, oi) {
        opt.setAttribute('aria-pressed', String(answered && sel === oi));
        opt.classList.toggle('is-correct', answered && oi === correct);
        opt.classList.toggle('is-wrong', answered && oi === sel && sel !== correct);
        opt.classList.toggle('is-dim', answered && oi !== correct && oi !== sel);
      });
      var fb = $('.quiz__fb', item);
      fb.textContent = answered ? (sel === correct ? item.dataset.ok : 'Não é essa') + ' — ' + item.dataset.why : '';
      fb.classList.toggle('is-wrong', answered && sel !== correct);
    });
    var allAnswered = qs.answered === qs.total;
    el.quizScore.textContent = allAnswered ? 'Você acertou ' + qs.correct + ' de ' + qs.total + '.' : '';
    el.quizScore.classList.toggle('is-perfect', allAnswered && qs.correct === qs.total);
    el.quizResetWrap.hidden = qs.answered === 0;

    // Painel "O que você produziu"
    var words = NOTE_IDS.reduce(function (t, id) { return t + (state.words[id] || 0); }, 0);
    var filled = NOTE_IDS.filter(function (id) { return (state.words[id] || 0) > 0; }).length;
    var checks = checkedCount('lgpd') + checkedCount('impl');
    var checksTotal = checklistItems('lgpd').length + checklistItems('impl').length;
    var stats = {
      mods: [dc + ' de ' + total, dc === total ? 'trilha percorrida de ponta a ponta' : 'marcados por você ao fim de cada módulo'],
      words: [plural(words, 'palavra', 'palavras'), filled + ' de ' + NOTE_IDS.length + ' espaços preenchidos'],
      checks: [checks + ' de ' + checksTotal, 'proteção de dados e implementação'],
      quiz: allAnswered
        ? [qs.correct + ' de ' + qs.total + ' corretas', 'respondido por inteiro']
        : ['em aberto', qs.answered + ' de ' + qs.total + ' respondidas']
    };
    Object.keys(stats).forEach(function (k) {
      $('[data-stat="' + k + '"]').textContent = stats[k][0];
      $('[data-stat-note="' + k + '"]').textContent = stats[k][1];
    });
    el.percursoDate.textContent = doneAtLabel();

    // Avisos e confirmações
    el.popupWarn.hidden = !state.popupBlocked;
    el.backupMsg.textContent = state.backupMsg;
    el.backupMsg.classList.toggle('is-error', state.backupError);
    el.citeMsg.textContent = state.citeMsg;

    renderSearch();
  }

  function renderSearch() {
    el.searchOverlay.hidden = !state.searchOpen;
    if (!state.searchOpen) return;

    var results = searchResults();
    var sel = Math.min(state.sel, Math.max(0, results.length - 1));
    lastResults = results;

    el.searchResults.textContent = '';
    results.forEach(function (r, i) {
      var a = document.createElement('a');
      a.className = 'search__result';
      a.id = 'search-opt-' + i;
      a.href = r.href;
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', String(i === sel));

      var head = document.createElement('div');
      head.className = 'search__result-head';
      var kind = document.createElement('span');
      kind.className = 'search__kind';
      kind.textContent = r.kind;
      var title = document.createElement('span');
      title.className = 'search__title';
      title.textContent = r.title;
      head.appendChild(kind);
      head.appendChild(title);
      a.appendChild(head);

      if (r.def) {
        var def = document.createElement('p');
        def.className = 'search__def';
        def.textContent = r.def;
        a.appendChild(def);
      }
      el.searchResults.appendChild(a);
    });

    el.searchEmpty.hidden = results.length > 0;
    if (results.length) {
      el.searchInput.setAttribute('aria-activedescendant', 'search-opt-' + sel);
      var active = byId('search-opt-' + sel);
      if (active) active.scrollIntoView({ block: 'nearest' });
    } else {
      el.searchInput.removeAttribute('aria-activedescendant');
    }
  }

  // ---------------------------------------------------------------------------
  // Busca
  // ---------------------------------------------------------------------------

  var lastFocus = null;

  function openSearch() {
    if (state.searchOpen) { el.searchInput.focus(); return; }
    lastFocus = document.activeElement;
    el.searchInput.value = '';
    setState({ searchOpen: true, query: '', sel: 0, navOpen: false });
    el.searchInput.focus();
  }

  function closeSearch() {
    if (!state.searchOpen) return;
    setState({ searchOpen: false });
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
  }

  function goTo(href) {
    var target = $(href);
    if (location.hash === href && target) target.scrollIntoView({ block: 'start' });
    else location.hash = href;
  }

  // ---------------------------------------------------------------------------
  // Rolagem: barra de progresso, item ativo do sumário, seção corrente
  // ---------------------------------------------------------------------------

  var lastSpy = null;
  var scrollQueued = false;

  function onScroll() {
    scrollQueued = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
    el.progressFill.style.width = p + '%';
    el.progressPct.textContent = Math.round(p) + '%';
    el.progressTrack.setAttribute('aria-valuenow', String(Math.round(p)));

    var cur = null;
    spies.forEach(function (s) {
      if (s.getBoundingClientRect().top <= 140) cur = s.getAttribute('data-spy');
    });
    el.navLinks.forEach(function (l) {
      var on = l.getAttribute('data-nav') === cur;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    if (cur && cur !== lastSpy) {
      lastSpy = cur;
      store.set('lastSection', cur);
    }
  }

  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(onScroll);
  }

  // ---------------------------------------------------------------------------
  // Cópia para a área de transferência
  // ---------------------------------------------------------------------------

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return Promise.reject(new Error('clipboard indisponível'));
  }

  var citeTimer = null;

  function copyCite(id, okMsg) {
    var node = byId(id);
    if (!node) return;
    var done = function (msg) {
      setState({ citeMsg: msg });
      clearTimeout(citeTimer);
      citeTimer = setTimeout(function () { setState({ citeMsg: '' }); }, 2600);
    };
    copyText((node.innerText || node.textContent).trim()).then(
      function () { done(okMsg); },
      function () { done('Não foi possível copiar — selecione o texto manualmente'); }
    );
  }

  function copyPrompt(btn) {
    var card = btn.closest('[data-prompt-card]');
    var p = card && $('.prompt-card__text', card);
    if (!p) return;
    var restore = function () { btn.textContent = 'Copiar'; };
    copyText((p.innerText || p.textContent).trim()).then(function () {
      btn.textContent = 'Copiado ✓';
      announce('Prompt copiado');
      setTimeout(restore, 1400);
    }, function () {
      btn.textContent = 'Selecione e copie';
      setTimeout(restore, 2000);
    });
  }

  // ---------------------------------------------------------------------------
  // Exportar caderno (janela nova + impressão)
  // ---------------------------------------------------------------------------

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function exportCaderno() {
    var name = state.certName.trim();
    var rows = NOTE_IDS.map(function (id) {
      var field = byId(id);
      var v = field ? field.value.trim() : '';
      return v ? '<h2>' + esc(NOTE_TITLES[id]) + '</h2><p>' + esc(v).replace(/\n/g, '<br>') + '</p>' : '';
    }).join('');

    var w = window.open('', '_blank');
    if (!w) { setState({ popupBlocked: true }); return; }
    setState({ popupBlocked: false });

    w.document.write(
      '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Caderno do cursista</title>' +
      '<style>body{font-family:Georgia,"Times New Roman",serif;max-width:640px;margin:48px auto;padding:0 28px;color:#1c1b16;line-height:1.7}' +
      'h1{font-size:28px;margin:0 0 4px}h2{font-size:13px;font-family:system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#1d6a46;margin:30px 0 6px}' +
      'p{white-space:pre-wrap;margin:0 0 12px}.meta{color:#6e685a;font-size:13px;font-family:system-ui,sans-serif;border-bottom:1px solid #ddd;padding-bottom:16px;margin-bottom:8px}' +
      '@media print{body{margin:0}}</style></head><body>' +
      '<h1>Caderno do cursista</h1><div class="meta">' + (name ? esc(name) + ' &middot; ' : '') +
      'IA na Educação Básica &middot; ' + new Date().toLocaleDateString('pt-BR') + '</div>' +
      (rows || '<p>Nenhuma anotação registrada ainda.</p>') +
      '<scr' + 'ipt>window.onload=function(){window.print()}</scr' + 'ipt></body></html>'
    );
    w.document.close();
  }

  // ---------------------------------------------------------------------------
  // Backup em arquivo
  // ---------------------------------------------------------------------------

  var backupTimer = null;

  function backupMessage(txt, isError) {
    setState({ backupMsg: txt, backupError: !!isError });
    clearTimeout(backupTimer);
    backupTimer = setTimeout(function () { setState({ backupMsg: '' }); }, 6000);
  }

  function buildBackup() {
    var notes = {};
    NOTE_IDS.forEach(function (id) {
      var field = byId(id);
      if (field && field.value.trim()) notes[id] = field.value;
    });
    var saved = {};
    BACKUP_KEYS.forEach(function (k) {
      // lastSection vem do armazenamento: o estado guarda a da visita anterior.
      var v = k === 'lastSection' ? (knownSection(store.get(k)) || state.lastSection) : state[k];
      if (v === undefined || v === null || v === '') return;
      if (typeof v === 'object' && !Object.keys(v).length) return;
      saved[k] = v;
    });
    return { app: APP_ID, versao: 2, salvoEm: new Date().toISOString(), notes: notes, state: saved };
  }

  function downloadBackup() {
    try {
      var data = buildBackup();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var d = new Date();
      var stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var a = document.createElement('a');
      a.href = url;
      a.download = 'caderno-trilha-ia-' + stamp + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      var n = Object.keys(data.notes).length;
      backupMessage('Backup baixado — ' + plural(n, 'anotação incluída', 'anotações incluídas') + '.');
    } catch (e) {
      backupMessage('Não foi possível gerar o backup neste navegador.', true);
    }
  }

  var BACKUP_VALIDATORS = {
    lgpd: asMap,
    impl: asMap,
    quiz: asMap,
    done: asMap,
    certName: asString,
    doneAt: function (v) { return asString(v) || null; },
    lastSection: knownSection
  };

  function applyBackup(data) {
    if (!data || data.app !== APP_ID) throw new Error('formato');

    var notes = asMap(data.notes);
    var words = Object.assign({}, state.words);
    NOTE_IDS.forEach(function (id) {
      var v = notes[id];
      var field = byId(id);
      if (!field || typeof v !== 'string') return;
      field.value = v;
      store.setRaw(id, v);
      words[id] = wordsOf(v);
    });

    var saved = asMap(data.state);
    var patch = { words: words };
    BACKUP_KEYS.forEach(function (k) {
      if (saved[k] === undefined) return;
      var v = BACKUP_VALIDATORS[k](saved[k]);
      // lastSection só alimenta a próxima visita; não mexe na capa atual.
      if (k === 'lastSection') { if (v) store.set(k, v); return; }
      patch[k] = v;
      store.set(k, v);
    });
    if (typeof patch.certName === 'string') el.certName.value = patch.certName;

    Object.assign(state, patch);
    ensureDoneAt();
    render();

    var n = Object.keys(notes).length;
    backupMessage('Backup restaurado — ' + plural(n, 'anotação', 'anotações') + ' e o progresso dos módulos.');
  }

  function onBackupFile(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try { applyBackup(JSON.parse(r.result)); }
      catch (err) { backupMessage('Arquivo inválido. Escolha um backup gerado por esta trilha.', true); }
    };
    r.onerror = function () { backupMessage('Não foi possível ler o arquivo.', true); };
    r.readAsText(f);
  }

  // ---------------------------------------------------------------------------
  // Eventos
  // ---------------------------------------------------------------------------

  function bind() {
    el.themeToggle.addEventListener('click', function () {
      var t = state.theme === 'dark' ? 'light' : 'dark';
      store.setRaw('theme', t);
      setState({ theme: t });
    });

    // Menu lateral
    el.navToggle.addEventListener('click', function () { setState({ navOpen: !state.navOpen }); });
    el.scrim.addEventListener('click', function () { setState({ navOpen: false }); });
    $$('a', el.sidenav).forEach(function (a) {
      a.addEventListener('click', function () { if (state.navOpen) setState({ navOpen: false }); });
    });

    // Busca
    el.searchOpen.addEventListener('click', openSearch);
    el.searchOverlay.addEventListener('click', function (e) { if (e.target === el.searchOverlay) closeSearch(); });
    el.searchInput.addEventListener('input', function () { setState({ query: el.searchInput.value, sel: 0 }); });
    el.searchResults.addEventListener('click', function (e) {
      var a = e.target.closest('a.search__result');
      if (!a) return;
      e.preventDefault();
      var href = a.getAttribute('href');
      closeSearch();
      goTo(href);
    });

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openSearch();
        return;
      }
      if (state.searchOpen) {
        var n = lastResults.length;
        if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
        else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && n) {
          e.preventDefault();
          var d = e.key === 'ArrowDown' ? 1 : -1;
          setState({ sel: (Math.min(state.sel, n - 1) + d + n) % n });
        }
        else if (e.key === 'Enter' && n) {
          e.preventDefault();
          var r = lastResults[Math.min(state.sel, n - 1)];
          closeSearch();
          goTo(r.href);
        }
        // Foco contido no diálogo: o único controle é o campo de busca.
        else if (e.key === 'Tab') { e.preventDefault(); el.searchInput.focus(); }
        return;
      }
      if (e.key === 'Escape' && state.navOpen) {
        setState({ navOpen: false });
        el.navToggle.focus();
      }
    });

    // Caderno e exercícios: grava a cada tecla
    NOTE_IDS.forEach(function (id) {
      var field = byId(id);
      if (!field) return;
      field.addEventListener('input', function () {
        var ok = store.setRaw(id, field.value);
        var words = Object.assign({}, state.words);
        words[id] = wordsOf(field.value);
        setState({ words: words, storageOk: state.storageOk && ok });
      });
    });

    // Exercício de alucinação
    el.flags.forEach(function (f) {
      f.addEventListener('click', function () { setState(toggleIn('found', f.getAttribute('data-k'))); });
    });

    // Checklists
    el.checklists.forEach(function (list) {
      var key = list.getAttribute('data-checklist');
      $$('.check', list).forEach(function (item, i) {
        item.addEventListener('click', function () {
          var patch = toggleIn(key, i);
          store.set(key, patch[key]);
          setState(patch);
        });
      });
    });

    // Quiz: resposta trocável
    el.quizItems.forEach(function (item, qi) {
      $$('.opt', item).forEach(function (opt, oi) {
        opt.addEventListener('click', function () {
          var quiz = Object.assign({}, state.quiz);
          quiz[qi] = oi;
          store.set('quiz', quiz);
          setState({ quiz: quiz });
        });
      });
    });
    byId('quiz-reset').addEventListener('click', function () {
      store.set('quiz', {});
      setState({ quiz: {} });
    });

    // Módulos concluídos
    el.doneButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var patch = toggleIn('done', btn.getAttribute('data-done'));
        store.set('done', patch.done);
        state.done = patch.done;
        ensureDoneAt();
        render();
      });
    });

    // Nome
    el.certName.addEventListener('input', function () {
      store.set('certName', el.certName.value);
      setState({ certName: el.certName.value });
    });

    // Cópias
    $$('[data-copy-prompt]').forEach(function (btn) {
      btn.addEventListener('click', function () { copyPrompt(btn); });
    });
    byId('copy-abnt').addEventListener('click', function () { copyCite('cite-abnt', 'Citação ABNT copiada'); });
    byId('copy-bibtex').addEventListener('click', function () { copyCite('cite-bibtex', 'BibTeX copiado'); });

    // Impressão, exportação e backup
    byId('print-trilha').addEventListener('click', function () { window.print(); });
    byId('export-caderno').addEventListener('click', exportCaderno);
    byId('backup-download').addEventListener('click', downloadBackup);
    byId('backup-restore').addEventListener('click', function () {
      el.backupFile.value = '';
      el.backupFile.click();
    });
    el.backupFile.addEventListener('change', onBackupFile);

    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', queueScroll);
  }

  // ---------------------------------------------------------------------------
  // Início
  // ---------------------------------------------------------------------------

  function init() {
    // Rótulo de atalho sensível à plataforma
    var kbd = isMac ? '⌘K' : 'Ctrl K';
    $$('[data-kbd]').forEach(function (k) { k.textContent = kbd; });
    el.searchOpen.setAttribute('aria-label', isMac ? 'Buscar (⌘K)' : 'Buscar (Ctrl+K)');

    // Restaura textos salvos
    NOTE_IDS.forEach(function (id) {
      var field = byId(id);
      if (!field) return;
      var v = store.getRaw(id);
      if (v != null) field.value = v;
      state.words[id] = wordsOf(field.value);
    });
    el.certName.value = state.certName;

    ensureDoneAt();
    bind();
    render();
    onScroll();
  }

  init();
})();
