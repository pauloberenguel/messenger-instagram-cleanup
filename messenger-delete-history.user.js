// ==UserScript==
// @name         Messenger - Limpar histórico com controle
// @namespace    local.messenger.cleanup
// @version      1.1.0
// @description  Exclui conversas visíveis do seu histórico, ignorando Marketplace, com recuperação de carregamento.
// @match        https://www.facebook.com/messages/*
// @match        https://www.facebook.com/messages
// @match        https://www.messenger.com/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  if (window.__messengerCleanerLoaded) return;
  window.__messengerCleanerLoaded = true;

  const state = { running: false, paused: false, stopRequested: false, deleted: 0, retries: 0, maxRetries: 30 };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clean = value => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const randomDelay = () => 3000 + Math.floor(Math.random() * 1001);
  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
  };
  const textOf = el => clean([el.innerText, el.getAttribute?.('aria-label'), el.getAttribute?.('title'), el.getAttribute?.('data-tooltip-content')].filter(Boolean).join(' '));
  const click = el => { el.scrollIntoView({ block: 'center', inline: 'nearest' }); el.click(); };
  const hover = el => {
    const r = el.getBoundingClientRect();
    for (const type of ['mouseover', 'mouseenter', 'mousemove']) el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: r.right - 12, clientY: r.top + r.height / 2 }));
  };

  function makePanel() {
    const panel = document.createElement('div');
    panel.id = 'messenger-cleaner-panel';
    panel.innerHTML = '<div style="font-weight:700;margin-bottom:7px">Limpeza do Messenger</div><button data-action="start">Iniciar</button><button data-action="pause" disabled>Pausar</button><button data-action="stop" disabled>Parar</button><span data-status style="margin-left:8px">Parado</span><div data-count style="margin-top:6px;font-size:11px">Conversas: 0</div>';
    Object.assign(panel.style, { position: 'fixed', top: '12px', right: '12px', zIndex: '2147483647', padding: '10px', background: '#242526', color: '#fff', border: '1px solid #777', borderRadius: '8px', font: '12px Arial,sans-serif', boxShadow: '0 3px 14px #0008' });
    document.body.appendChild(panel);
    panel.querySelectorAll('button').forEach(button => Object.assign(button.style, { marginRight: '4px', padding: '4px 8px', cursor: 'pointer' }));
    return panel;
  }

  const panel = makePanel();
  const status = value => { panel.querySelector('[data-status]').textContent = value; };
  const count = () => { panel.querySelector('[data-count]').textContent = `Conversas nesta execução: ${state.deleted}`; };
  const buttons = () => ({ start: panel.querySelector('[data-action="start"]'), pause: panel.querySelector('[data-action="pause"]'), stop: panel.querySelector('[data-action="stop"]') });

  function isMarketplace(el) { const t = textOf(el); return t.includes('marketplace') || t.includes('mercado livre'); }
  function inChatList(el) { const r = el.getBoundingClientRect(); return visible(el) && r.left < 460 && r.top > 205 && r.height >= 35 && r.height <= 140; }

  function conversationRows() {
    const selectors = ['[role="link"]', '[role="listitem"]', '[role="row"]', 'a[href*="/messages/"]', 'a[href*="/t/"]'];
    const all = [...new Set(selectors.flatMap(selector => [...document.querySelectorAll(selector)]))];
    const rows = all.filter(inChatList).filter(el => textOf(el).length > 2 && !isMarketplace(el));
    return rows.filter(el => !rows.some(other => other !== el && other.contains(el) && other.getBoundingClientRect().height >= el.getBoundingClientRect().height));
  }

  function scrollChatList() {
    const rows = conversationRows();
    const seed = rows[rows.length - 1] || rows[0];
    let ancestor = seed;
    while (ancestor && ancestor !== document.body) {
      const style = getComputedStyle(ancestor);
      const r = ancestor.getBoundingClientRect();
      if (r.left < 460 && ancestor.scrollHeight > ancestor.clientHeight + 20 && /(auto|scroll)/.test(style.overflowY)) {
        ancestor.scrollTop = Math.min(ancestor.scrollHeight, ancestor.scrollTop + Math.max(350, ancestor.clientHeight * 0.85));
        ancestor.dispatchEvent(new Event('scroll', { bubbles: true }));
        return;
      }
      ancestor = ancestor.parentElement;
    }
    if (seed) seed.scrollIntoView({ block: 'end', inline: 'nearest' });
  }

  function optionButtons() {
    const words = ['options', 'more', 'mais', 'opções', 'opcoes', 'ações', 'acoes'];
    return [...document.querySelectorAll('button, [role="button"]')].filter(visible).filter(el => {
      const r = el.getBoundingClientRect(), t = textOf(el);
      return r.left < 460 && r.top > 205 && words.some(word => t === word || t.includes(word));
    });
  }

  function clickThreeDots(row) {
    const r = row.getBoundingClientRect();
    const points = [
      [r.right - 28, r.top + r.height / 2],
      [r.right - 40, r.top + r.height / 2],
      [r.right - 18, r.top + r.height / 2]
    ];
    for (const [x, y] of points) {
      const el = document.elementFromPoint(x, y);
      if (!el || !row.contains(el)) continue;
      const clickable = el.closest('button, [role="button"]') || el;
      const cr = clickable.getBoundingClientRect();
      if (cr.width > 90 || cr.height > 90) continue;
      clickable.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
      clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
      clickable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
      clickable.click();
      return true;
    }
    return false;
  }

  function deleteItem() {
    const words = ['delete chat', 'delete conversation', 'delete', 'excluir bate-papo', 'excluir conversa', 'excluir', 'apagar conversa', 'apagar bate-papo', 'apagar'];
    return [...document.querySelectorAll('[role="menuitem"], [role="option"], button, [role="button"], a')].filter(visible).find(el => {
      const t = textOf(el); return words.some(word => t === word || t.includes(word)) && !t.includes('download') && !t.includes('baixar');
    });
  }

  function confirmButton() {
    const dialogs = [...document.querySelectorAll('[role="dialog"], [aria-modal="true"]')].filter(visible), scope = dialogs.pop() || document;
    const words = ['delete', 'excluir', 'apagar', 'confirm', 'confirmar'];
    return [...scope.querySelectorAll('button, [role="button"], [role="menuitem"]')].filter(visible).find(el => {
      const t = textOf(el); return words.some(word => t === word || t.includes(word)) && !t.includes('cancel') && !t.includes('cancelar');
    });
  }

  async function waitFor(fn, timeout = 3000) {
    const end = Date.now() + timeout;
    while (Date.now() < end && state.running && !state.stopRequested) {
      while (state.paused && state.running && !state.stopRequested) await sleep(250);
      const found = fn(); if (found) return found; await sleep(120);
    }
    return null;
  }

  async function deleteOne() {
    const row = conversationRows()[0];
    if (!row) { scrollChatList(); return false; }
    hover(row); await sleep(600);
    let opened = clickThreeDots(row);
    if (!opened) {
      hover(row); await sleep(900);
      opened = clickThreeDots(row);
    }
    if (!opened) {
      const options = optionButtons();
      if (!options.length) return false;
      options.sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left);
      const target = options[0], tr = target.getBoundingClientRect();
      if (target === row || target.contains(row) || tr.width > 90 || tr.height > 90) return false;
      click(target);
    }
    await sleep(450);
    const del = await waitFor(deleteItem);
    if (!del) { document.body.click(); return false; }
    click(del); await sleep(500);
    const confirm = await waitFor(confirmButton);
    if (confirm) click(confirm);
    state.deleted++; count();
    await sleep(900);
    scrollChatList();
    await sleep(randomDelay());
    return true;
  }

  async function worker() {
    status('Executando');
    while (state.running && !state.stopRequested) {
      while (state.paused && state.running && !state.stopRequested) { status(`Pausado — ${state.deleted}`); await sleep(250); }
      if (!state.running || state.stopRequested) break;
      const ok = await deleteOne();
      if (ok) { state.retries = 0; continue; }
      state.retries++;
      if (state.retries <= state.maxRetries) { status(`Atualizando lista (${state.retries}/${state.maxRetries})`); scrollChatList(); await sleep(1200 + state.retries * 300); continue; }
      status('Nenhuma conversa encontrada'); break;
    }
    state.running = false; state.paused = false; state.stopRequested = false;
    const b = buttons(); b.start.disabled = false; b.pause.disabled = true; b.stop.disabled = true; b.pause.textContent = 'Pausar';
    if (status !== 'Pausado') status(state.deleted ? `Finalizado — ${state.deleted}` : 'Parado');
  }

  function start() {
    if (state.running) return;
    state.running = true; state.paused = false; state.stopRequested = false; state.retries = 0; state.deleted = 0; count();
    const b = buttons(); b.start.disabled = true; b.pause.disabled = false; b.stop.disabled = false; worker();
  }
  function togglePause() { if (!state.running) return; state.paused = !state.paused; buttons().pause.textContent = state.paused ? 'Continuar' : 'Pausar'; status(state.paused ? `Pausado — ${state.deleted}` : 'Executando'); }
  function stop() { state.stopRequested = true; state.paused = false; status('Parando...'); }

  buttons().start.onclick = start; buttons().pause.onclick = togglePause; buttons().stop.onclick = stop;
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && state.running) stop(); });
})();
