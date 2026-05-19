// src/services/socket.js
import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
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

        if (this.socket && this.isConnected) {
            console.log('✅ Socket already connected');
            return this.socket;
        }

        // Disconnect existing socket if any
        if (this.socket) {
            this.disconnect();
        }

        this.currentUserEmail = userEmail;
        
        const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://stilt-ardently-recoup.ngrok-free.dev'; //http://localhost:5000
        
        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.register(userEmail);
            this.processEventQueue();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
            
            // Handle specific disconnect reasons
            if (reason === 'io server disconnect') {
                // Server disconnected, attempt to reconnect manually
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
            // Queue registration for when connection is established
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

    on(eventName, callback) {
        if (!eventName || typeof callback !== 'function') {
            console.error('❌ Invalid event registration');
            return;
        }
        
        if (this.socket) {
            // Remove existing listener if any
            this.off(eventName);
            
            this.socket.on(eventName, callback);
            this.listeners.set(eventName, callback);
            console.log(`🎧 Listening to event: ${eventName}`);
        } else {
            console.warn(`⚠️ Socket not initialized, cannot listen to: ${eventName}`);
        }
    }

    once(eventName, callback) {
        if (this.socket) {
            this.socket.once(eventName, callback);
            console.log(`🎧 One-time listener registered for: ${eventName}`);
        }
    }

    off(eventName) {
        if (this.socket) {
            const callback = this.listeners.get(eventName);
            if (callback) {
                this.socket.off(eventName, callback);
                this.listeners.delete(eventName);
                console.log(`🔇 Stopped listening to event: ${eventName}`);
            }
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.listeners.forEach((callback, eventName) => {
                this.socket.off(eventName, callback);
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

    // Health check method
    isAlive() {
        return this.isConnected && this.socket?.connected;
    }
}

export default new SocketService();