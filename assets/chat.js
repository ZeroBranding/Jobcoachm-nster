import { io } from 'socket.io-client';

const socket = io({ transports: ['websocket'], autoConnect: false });

const toggleBtn = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-widget');
const chatClose = document.getElementById('chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messages = document.getElementById('chat-messages');

function appendMessage(msg, own = false) {
  const div = document.createElement('div');
  div.textContent = msg;
  div.className = own ? 'own' : 'remote';
  messages.append(div);
  messages.scrollTop = messages.scrollHeight;
}

toggleBtn?.addEventListener('click', () => {
  const open = chatWidget.classList.toggle('open');
  chatWidget.hidden = !open;
  toggleBtn.setAttribute('aria-expanded', String(open));
  if (open && !socket.connected) socket.connect();
});

chatClose?.addEventListener('click', () => {
  chatWidget.classList.remove('open');
  chatWidget.hidden = true;
  toggleBtn.setAttribute('aria-expanded', 'false');
});

chatForm?.addEventListener('submit', e => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  appendMessage(text, true);
  socket.emit('message', text);
  chatInput.value = '';
});

socket.on('connect', () => appendMessage('Support verbunden'));
socket.on('message', data => appendMessage(data));