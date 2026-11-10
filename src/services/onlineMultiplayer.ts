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

  public connect(): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.startHeartbeat();
          this.emit('connection_status', { connected: true });
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
          console.error('WebSocket error:', err);
          this.emit('connection_status', { connected: false, error: err });
          resolve(false);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('connection_status', { connected: false });
        };
      } catch (e) {
        console.error('Failed to initiate WebSocket:', e);
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
