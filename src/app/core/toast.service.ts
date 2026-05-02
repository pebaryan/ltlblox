import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public toastQueue = signal<ToastMessage[]>([]);
  private toastTimeouts = new Map<number, ReturnType<typeof setTimeout>>();
  private toastIdCounter = 0;

  constructor() {
    // Auto-clear old toasts
    setInterval(() => this.clearOldToasts(), 1000);
  }

  show(message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info', duration: number = 3000) {
    const id = ++this.toastIdCounter;
    const toast: ToastMessage = { id, message, type, duration };
    
    this.toastQueue.update((queue) => [...queue, toast]);

    // Auto-dismiss after duration
    const timeout = setTimeout(() => {
      this.removeToast(id);
    }, duration);

    this.toastTimeouts.set(id, timeout);
  }

  private removeToast(id: number) {
    this.toastQueue.update((queue) => queue.filter((t) => t.id !== id));
    
    const timeout = this.toastTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.toastTimeouts.delete(id);
    }
  }

  private clearOldToasts() {
    const queue = this.toastQueue();
    const now = Date.now();
    const activeToasts: ToastMessage[] = [];

    for (const toast of queue) {
      const timeout = this.toastTimeouts.get(toast.id);
      if (!timeout || now - timeout > toast.duration!) {
        this.removeToast(toast.id);
      } else {
        activeToasts.push(toast);
      }
    }

    this.toastQueue.set(activeToasts);
  }

  clearAll() {
    this.toastQueue.set([]);
    this.toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.toastTimeouts.clear();
  }
}