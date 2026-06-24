// src/services/socket.js
import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();   // event → array of callbacks
        this.isConnected = false;
        this.currentUserEmail = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.eventQueue = [];
    }

    connect(userEmail) {
        if (!userEmail) {
            console.error('❌ Cannot connect: No user email provided');
            return null;
        }

        // Reuse an existing socket for the SAME user (connected OR still connecting).
        // Do NOT disconnect — that wipes listeners other components just registered.
        if (this.socket) {
            if (this.currentUserEmail === userEmail) {
                return this.socket;
            }
            // Different user — only then tear down and rebuild
            this.disconnect();
        }

        this.currentUserEmail = userEmail;

        const RAW = import.meta.env.VITE_API_URL || "http://192.168.23.17:5000/api" || "http://localhost:5000/api";
        const SOCKET_URL = RAW.replace(/\/api\/?$/, '');
        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.register(this.currentUserEmail);
            this.processEventQueue();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;

            if (reason === 'io server disconnect') {
                setTimeout(() => {
                    if (this.currentUserEmail) {
                        this.connect(this.currentUserEmail);
                    }
                }, 1000);
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.isConnected = false;
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached. Giving up.');
                this.socket?.close();
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
            this.register(this.currentUserEmail);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Socket reconnection attempt:', attemptNumber);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed');
            this.isConnected = false;
        });

        return this.socket;
    }

    register(userEmail) {
        if (this.socket && this.isConnected && userEmail) {
            this.socket.emit('register', userEmail, (response) => {
                if (response && response.status === 'ok') {
                    console.log('📝 Successfully registered user:', userEmail);
                } else {
                    console.warn('⚠️ Registration response not acknowledged');
                }
            });
            console.log('📝 Registered user:', userEmail);
        } else {
            this.queueEvent('register', { userEmail });
        }
    }

    queueEvent(eventName, data) {
        this.eventQueue.push({ eventName, data });
        console.log(`📦 Event queued: ${eventName}`);
    }

    processEventQueue() {
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            console.log(`📤 Processing queued event: ${event.eventName}`);
            if (event.eventName === 'register') {
                this.register(event.data.userEmail);
            } else {
                this.emit(event.eventName, event.data);
            }
        }
    }

    emit(eventName, data, callback = null) {
        if (this.socket && this.isConnected) {
            if (callback) {
                this.socket.emit(eventName, data, callback);
            } else {
                this.socket.emit(eventName, data);
            }
            console.log(`📤 Emitted event: ${eventName}`);
        } else {
            console.warn(`⚠️ Socket not connected, queuing event: ${eventName}`);
            this.queueEvent(eventName, data);
        }
    }

    joinTicketRoom(ticketId) {
        if (!ticketId) {
            console.warn('⚠️ Cannot join room: No ticket ID provided');
            return;
        }
        if (this.socket && this.isConnected) {
            this.socket.emit('join-ticket-room', ticketId);
            console.log(`📌 Joined ticket room: ${ticketId}`);
        } else {
            this.queueEvent('join-ticket-room', { ticketId });
        }
    }

    leaveTicketRoom(ticketId) {
        if (!ticketId) {
            console.warn('⚠️ Cannot leave room: No ticket ID provided');
            return;
        }
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-ticket-room', ticketId);
            console.log(`🚪 Left ticket room: ${ticketId}`);
        }
    }

    // ── Multiple handlers per event ──
    on(eventName, callback) {
        if (!eventName || typeof callback !== 'function') {
            console.error('❌ Invalid event registration');
            return;
        }
        if (!this.socket) {
            console.warn(`⚠️ Socket not initialized, cannot listen to: ${eventName}`);
            return;
        }

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        const arr = this.listeners.get(eventName);

        // don't double-register the exact same callback
        if (arr.includes(callback)) return;

        arr.push(callback);
        this.socket.on(eventName, callback);
        console.log(`🎧 Listening to event: ${eventName} (${arr.length} handler(s))`);
    }

    once(eventName, callback) {
        if (this.socket) {
            this.socket.once(eventName, callback);
            console.log(`🎧 One-time listener registered for: ${eventName}`);
        }
    }

    // off(event)            → removes ALL handlers for that event
    // off(event, callback)  → removes only that one handler
    off(eventName, callback) {
        if (!this.socket) return;
        const arr = this.listeners.get(eventName);
        if (!arr) return;

        if (callback) {
            this.socket.off(eventName, callback);
            const next = arr.filter(cb => cb !== callback);
            if (next.length) this.listeners.set(eventName, next);
            else this.listeners.delete(eventName);
            console.log(`🔇 Removed one handler for: ${eventName}`);
        } else {
            arr.forEach(cb => this.socket.off(eventName, cb));
            this.listeners.delete(eventName);
            console.log(`🔇 Stopped listening to event: ${eventName}`);
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.listeners.forEach((arr, eventName) => {
                arr.forEach(cb => this.socket.off(eventName, cb));
            });
            this.listeners.clear();
            console.log('🔇 Removed all event listeners');
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id || null,
            currentUserEmail: this.currentUserEmail,
            reconnectAttempts: this.reconnectAttempts,
            queuedEvents: this.eventQueue.length
        };
    }

    disconnect() {
        if (this.socket) {
            this.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentUserEmail = null;
            this.reconnectAttempts = 0;
            this.eventQueue = [];
            console.log('🔌 Socket disconnected and cleaned up');
        }
    }

    isAlive() {
        return this.isConnected && this.socket?.connected;
    }
}

export default new SocketService();