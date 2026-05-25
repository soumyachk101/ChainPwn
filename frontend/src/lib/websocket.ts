import type { StreamMessage } from "@/types/vulnerability";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(msg: StreamMessage) => void>> = new Map();

  connect(jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_BASE}/ws/stream/${jobId}`);
        this.ws.onopen = () => resolve();
        this.ws.onmessage = (event) => {
          try {
            const msg: StreamMessage = JSON.parse(event.data);
            this.emit(msg.type, msg);
            this.emit("*", msg);
          } catch {
            const rawMsg: StreamMessage = { type: "LOG", data: event.data };
            this.emit("LOG", rawMsg);
            this.emit("*", rawMsg);
          }
        };
        this.ws.onerror = (error) => reject(error);
        this.ws.onclose = () => {
          this.emit("RESULT", { type: "RESULT", data: { success: false, error: "Connection closed" } });
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  on(type: string, callback: (msg: StreamMessage) => void): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(callback);
    return () => { this.listeners.get(type)?.delete(callback); };
  }

  private emit(type: string, msg: StreamMessage): void {
    this.listeners.get(type)?.forEach((cb) => cb(msg));
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.listeners.clear();
  }
}
