const apiUrl = 'http://localhost:3001/api/auth';
const socket = io('http://localhost:3001', {
  withCredentials: true
});

let userId = null;

const log = (msg) => {
  const div = document.getElementById('log');
  div.innerHTML += `<p>${msg}</p>`;
};

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { username, email, password } = e.target;

  const response = await fetch(`${apiUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value
    }),
  });

  const data = await response.json();
  console.log(data);
  log('Зарегистрирован: ' + JSON.stringify(data));
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { username, password } = e.target;

  const res = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  log('Вход выполнен');

  const profile = await fetch(`${apiUrl}/profile`, {
    headers: {
      'Authorization': 'Bearer ' + data.accessToken
    }
  });

  const profileData = await profile.json();
  userId = profileData.id;
  log('userId: ' + userId);
});

document.getElementById('create-room-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!userId) return log('❌ Сначала войди, чтобы создать комнату');

  const name = e.target.roomName.value;
  const mode = e.target.mode.value;
  const password = e.target.password.value;

  socket.emit('createRoom', { name, mode, password, userId });
  log('🛠 Отправлен запрос на создание комнаты');
});

socket.on('roomCreated', ({ roomId }) => {
  log(`✅ Комната создана. ID: ${roomId}`);
});

socket.on('joinError', msg => {
  log('❌ Ошибка: ' + msg);
});

socket.on('roomJoined', ({ room, players }) => {
  log(`✅ Подключён к комнате: ${room.name}`);
  displayPlayers(players, room.masterId);
});

function displayPlayers(players, masterId) {
  const ul = document.createElement('ul');
  players.forEach(p => {
    const icon = (p.id === masterId) ? '👑' : '🧍';
    const li = document.createElement('li');
    li.textContent = `${icon} ${p.name}`;
    ul.appendChild(li);
  });
  document.getElementById('log').appendChild(ul);
}

function joinRoom(roomId, mode) {
  if (!userId) return log('❌ Сначала войди, чтобы подключаться');

  let password = '';
  if (mode === 'protected') {
    password = prompt('Введите пароль:');
  }

  socket.emit('joinRoom', { roomId, userId, password });
  log(`⏳ Запрос на вход в комнату: ${roomId}`);
}

document.getElementById('fetch-rooms').addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/rooms');
    const rooms = await response.json();

    if (!Array.isArray(rooms)) {
      console.error('Некорректный ответ от сервера:', rooms);
      return;
    }

    const list = document.getElementById('room-list');
    list.innerHTML = '';
    rooms.forEach(room => {
      const li = document.createElement('li');
      li.innerHTML = `
        🏰 <b>${room.name}</b> (${room.mode}) - Игроков: ${room.players?.length || 0}
        <button onclick="joinRoom('${room.id}', '${room.mode}')">Присоединиться</button>
      `;
      list.appendChild(li);
    });

    log(`🔄 Получено ${rooms.length} комнат`);
  } catch (err) {
    console.error('Ошибка при получении комнат:', err);
  }
});
