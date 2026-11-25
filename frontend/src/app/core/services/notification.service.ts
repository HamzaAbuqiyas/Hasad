import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

/**
 * Messages for the user (shown by <app-toast-container> in app.html).
 * Replaces the alert() calls that were spread over every page.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  success(text: string): void { this.show('success', text); }
  error(text: string): void { this.show('error', text, 6000); }
  info(text: string): void { this.show('info', text); }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  /** Yes/No question before a dangerous action (delete, block...). */
  confirm(question: string): boolean {
    return window.confirm(question);
  }

  private show(kind: ToastKind, text: string, durationMs = 3500): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}
