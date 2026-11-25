'use strict';

const slides = [...document.querySelectorAll('.slide')];
const previous = document.getElementById('prev');
const next = document.getElementById('next');
const position = document.getElementById('position');
const slidePicker = document.getElementById('slide-picker');
const guidesButton = document.getElementById('guides');
let current = 0;
let notesWindow;

const slideChoices = slides.map((slide, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = `${index + 1}. ${slide.querySelector('h1, h2').textContent}`;
  button.onclick = () => {
    showSlide(index);
    setSlidePicker(false);
    position.focus();
  };
  slidePicker.append(button);
  return button;
});

function setSlidePicker(open) {
  slidePicker.hidden = !open;
  position.setAttribute('aria-expanded', String(open));
  if (open) {
    slideChoices[current].focus({ preventScroll: true });
    slideChoices[current].scrollIntoView({ block: 'nearest' });
  }
}

function updateNotes() {
  if (!notesWindow || notesWindow.closed) return;
  const slide = slides[current];
  notesWindow.document.querySelector('h1').textContent = slide.querySelector('h1, h2').textContent;
  notesWindow.document.querySelector('output').textContent = position.textContent;
  notesWindow.document.querySelector('article').replaceChildren(
    notesWindow.document.importNode(slide.querySelector('.notes').content, true)
  );
}

function showSlide(index) {
  slides[current].hidden = true;
  slideChoices[current].removeAttribute('aria-current');
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides[current].hidden = false;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  position.textContent = `${current + 1} / ${slides.length}`;
  position.setAttribute('aria-label', `Välj bild, ${current + 1} av ${slides.length}`);
  slideChoices[current].setAttribute('aria-current', 'true');
  updateNotes();
}

function openNotes() {
  if (!notesWindow || notesWindow.closed) {
    notesWindow = window.open('', '', 'popup,width=650,height=480');
    if (!notesWindow) return;
    notesWindow.document.write(`<!doctype html><html lang="sv"><meta charset="utf-8">
      <title>Talarstöd – Webbutveckling nivå 1</title>
      <style>body{margin:2rem;font:1.2rem/1.55 system-ui,sans-serif;color:#1d304a}
      h1{line-height:1.15} article{max-width:60ch}</style>
      <body><output></output><h1></h1><article></article>
      <p><button id="back">Föregående</button> <button id="forward">Nästa</button></p></body></html>`);
    notesWindow.document.close();
    notesWindow.document.getElementById('back').onclick = () => showSlide(current - 1);
    notesWindow.document.getElementById('forward').onclick = () => showSlide(current + 1);
    notesWindow.addEventListener('keydown', handleKeyboard);
  }
  updateNotes();
  notesWindow.focus();
}

function toggleGuides() {
  const active = guidesButton.getAttribute('aria-pressed') === 'true';
  guidesButton.setAttribute('aria-pressed', String(!active));
  document.querySelectorAll('.camera-guide, .caption-guide').forEach(el => {
    el.hidden = active;
  });
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // The browser's own fullscreen command remains available.
  }
}

function handleKeyboard(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
  if (!slidePicker.hidden && event.view === window) {
    if (event.key === 'Escape') {
      setSlidePicker(false);
      position.focus();
      event.preventDefault();
    }
    return;
  }
  if (event.key === ' ' && event.target.tagName === 'BUTTON') return;

  switch (event.key.toLowerCase()) {
    case 'arrowright':
    case 'pagedown':
    case ' ':
      showSlide(current + 1);
      break;
    case 'arrowleft':
    case 'pageup':
      showSlide(current - 1);
      break;
    case 'home':
      showSlide(0);
      break;
    case 'end':
      showSlide(slides.length - 1);
      break;
    case 's':
      openNotes();
      break;
    case 'g':
      toggleGuides();
      break;
    case 'r':
      document.body.classList.toggle('recording');
      break;
    case 'f':
      if (event.view !== window) return;
      toggleFullscreen();
      break;
    default:
      return;
  }
  event.preventDefault();
}

previous.onclick = () => showSlide(current - 1);
next.onclick = () => showSlide(current + 1);
position.onclick = () => setSlidePicker(slidePicker.hidden);
document.addEventListener('click', event => {
  if (!slidePicker.hidden && !position.contains(event.target) && !slidePicker.contains(event.target)) {
    setSlidePicker(false);
  }
});
document.getElementById('notes').onclick = openNotes;
guidesButton.onclick = toggleGuides;
document.getElementById('fullscreen').onclick = toggleFullscreen;
window.addEventListener('keydown', handleKeyboard);
showSlide(0);
