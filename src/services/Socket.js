// src/services/socket.js
import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isConnected = false;
    }

    connect(userEmail) {
        if (!this.socket && userEmail) {
            const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket connected:', this.socket.id);
                this.isConnected = true;
                this.register(userEmail);
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                this.isConnected = false;
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                this.isConnected = false;
            });
        }
        return this.socket;
    }

    register(userEmail) {
        if (this.socket && userEmail) {
            this.socket.emit('register', userEmail);
            console.log('📝 Registered user:', userEmail);
        }
    }

    joinTicketRoom(ticketId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-ticket-room', ticketId);
        }
    }

    leaveTicketRoom(ticketId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-ticket-room', ticketId);
        }
    }

    on(eventName, callback) {
        if (this.socket) {
            this.socket.on(eventName, callback);
            this.listeners.set(eventName, callback);
        }
    }

    off(eventName) {
        if (this.socket) {
            const callback = this.listeners.get(eventName);
            if (callback) {
                this.socket.off(eventName, callback);
                this.listeners.delete(eventName);
            }
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.listeners.clear();
        }
    }
}

export default new SocketService();