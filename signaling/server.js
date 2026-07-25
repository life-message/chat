const WebSocket = require('ws');

const PORT = 8080;
const rooms = new Map();

const wss = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });

wss.on('connection', (ws, req) => {
  const room = new URL(req.url, 'http://localhost').pathname.split('/')[2] || 'default';
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);

  ws.on('message', (data) => {
    const msg = data.toString();
    for (const c of rooms.get(room))
      if (c !== ws && c.readyState === WebSocket.OPEN) c.send(msg);
  });

  ws.on('close', () => {
    rooms.get(room).delete(ws);
    if (!rooms.get(room).size) return rooms.delete(room);
    for (const c of rooms.get(room))
      if (c.readyState === WebSocket.OPEN) c.send('{"type":"users/exit"}');
  });
});
