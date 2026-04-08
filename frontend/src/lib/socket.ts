import { io, type Socket } from 'socket.io-client';

const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
const SOCKET_BASE =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
  (currentOrigin.includes(':3000') || currentOrigin.includes(':5173')
    ? 'http://localhost:5000'
    : currentOrigin);

let socketInstance: Socket | null = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_BASE, {
      transports: ['websocket', 'polling'],
    });
  }

  return socketInstance;
}

export function closeSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
