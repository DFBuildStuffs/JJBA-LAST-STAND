import { OnlineRoomState } from '../types/game';

type EventCallback = (data: any) => void;

class OnlineMultiplayerService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private heartbeatInterval: any = null;
  public myPlayerId: number | null = null;
  public myRoomCode: string | null = null;
  public isConnected: boolean = false;

  constructor() {
    // Lazy connect when user opens Online Lobby
  }

  public getServerUrl(): string {
    const customUrl = typeof window !== 'undefined' ? localStorage.getItem('jojo_custom_ws_url') : null;
    if (customUrl && customUrl.trim()) return customUrl.trim();

    const envUrl = (import.meta as any).env?.VITE_WS_URL;
    if (envUrl && envUrl.trim()) return envUrl.trim();

    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws`;
    }
    return 'ws://localhost:3000/ws';
  }

  public setCustomWsUrl(url: string | null) {
    if (typeof window !== 'undefined') {
      if (url && url.trim()) {
        localStorage.setItem('jojo_custom_ws_url', url.trim());
      } else {
        localStorage.removeItem('jojo_custom_ws_url');
      }
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
    this.connect();
  }

  public connect(): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      try {
        const wsUrl = this.getServerUrl();
        this.emit('connection_status', { connected: false, connecting: true, url: wsUrl });

        this.ws = new WebSocket(wsUrl);

        // Timeout guard: if connection hangs for more than 4 seconds (common on serverless 404s)
        const connectTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.emit('connection_status', {
              connected: false,
              connecting: false,
              error: 'Connection timeout. No persistent WebSocket server found at this URL.',
              url: wsUrl,
              isVercelError: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'),
            });
            resolve(false);
          }
        }, 4000);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.isConnected = true;
          this.startHeartbeat();
          this.emit('connection_status', { connected: true, connecting: false, url: wsUrl });
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'pong') return;
            this.emit(data.type, data);
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        };

        this.ws.onerror = (err) => {
          clearTimeout(connectTimeout);
          console.error('WebSocket connection error:', err);
          const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
          this.emit('connection_status', {
            connected: false,
            connecting: false,
            error: isVercel
              ? 'Vercel is a serverless platform and cannot host persistent WebSocket servers. Please deploy your backend on Render/Railway, or configure VITE_WS_URL.'
              : 'Failed to connect to multiplayer server at ' + wsUrl,
            url: wsUrl,
            isVercelError: isVercel,
          });
          resolve(false);
        };

        this.ws.onclose = () => {
          clearTimeout(connectTimeout);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('connection_status', { connected: false, connecting: false, url: wsUrl });
        };
      } catch (e) {
        console.error('Failed to initiate WebSocket:', e);
        this.emit('connection_status', { connected: false, connecting: false, error: String(e) });
        resolve(false);
      }
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', {});
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public send(action: string, data: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, ...data }));
    } else {
      this.connect().then((ok) => {
        if (ok && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ action, ...data }));
        } else {
          const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
          const message = isVercel
            ? 'Cannot create room: Vercel serverless hosting does not support persistent WebSockets. To play online, deploy the app to Render/Railway or configure VITE_WS_URL.'
            : 'Multiplayer server is currently offline or unreachable. Please verify server status.';
          this.emit('error', { message });
        }
      });
    }
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  // Room actions
  public createRoom(name: string, characterId: string) {
    this.send('create_room', { name, characterId });
  }

  public joinRoom(code: string, name: string, characterId: string) {
    this.send('join_room', { code, name, characterId });
  }

  public selectCharacter(characterId: string) {
    this.send('select_character', { characterId });
  }

  public toggleReady() {
    this.send('toggle_ready', {});
  }

  public startGame() {
    this.send('start_game', {});
  }

  public rollDice() {
    this.send('roll_dice', {});
  }

  public useAbility(abilityOrId: string | { id: string; spCost: number }, spCost?: number) {
    if (typeof abilityOrId === 'object') {
      this.send('use_ability', { abilityId: abilityOrId.id, spCost: abilityOrId.spCost });
    } else {
      this.send('use_ability', { abilityId: abilityOrId, spCost: spCost || 0 });
    }
  }

  public clashTap(side?: 'attacker' | 'defender') {
    this.send('clash_tap', { side: side || 'attacker' });
  }

  public resolveClash(winnerId: number, loserId?: number) {
    this.send('resolve_clash', { winnerId, loserId });
  }

  public sendTaunt(message: string) {
    this.send('send_taunt', { message });
  }

  public leaveRoom() {
    this.send('leave_room', {});
    this.myPlayerId = null;
    this.myRoomCode = null;
  }
}

export const onlineService = new OnlineMultiplayerService();
