/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * METRÓNOMO AUDIBLE PARA RCP (110 BPM)
 * -------------------------------------------------------------
 * Las guías internacionales de reanimación (AHA, Cruz Roja) exigen 100 a 120 compresiones por minuto.
 * Este módulo genera pulsos de audio precisos a 110 BPM usando la Web Audio API nativa.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. Restricción de Autoplay: Los navegadores modernos suspenden el AudioContext hasta que
 *    el usuario hace clic explícitamente en la pantalla. Siempre llamar a `audioCtx.resume()`.
 * 2. Imprecisión de setInterval(): setInterval sufre retrasos en JavaScript por la cola de eventos.
 *    Para un ritmo médico exacto, se debe usar el reloj del sistema de audio (`audioCtx.currentTime`).
 */

class RcpMetronome {
  private audioCtx: AudioContext | null = null;
  private isRunning: boolean = false;
  private bpm: number = 110; // Ritmo estándar ideal de 110 compresiones por minuto
  private timerId: number | null = null;
  private nextBeatTime: number = 0;
  private listeners: Set<(beatCount: number) => void> = new Set();
  private beatCounter: number = 0;

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public subscribe(callback: (beatCount: number) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private playBeep(time: number): void {
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      // Frecuencia agradable (880 Hz, nota La5) similar a monitores clínicos
      osc.frequency.setValueAtTime(880, time);

      // Envolvente rápida para un "bip" seco sin reverberación molesta
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      osc.start(time);
      osc.stop(time + 0.08);
    } catch (err) {
      console.warn('[AuxilioApp] Error en oscilador de audio:', err);
    }
  }

  private schedule(): void {
    if (!this.isRunning || !this.audioCtx) return;

    const secondsPerBeat = 60.0 / this.bpm;
    const scheduleAheadTime = 0.1; // Programa bips 100ms antes para evitar desfasajes

    while (this.nextBeatTime < this.audioCtx.currentTime + scheduleAheadTime) {
      this.playBeep(this.nextBeatTime);
      this.beatCounter++;
      this.listeners.forEach((fn) => fn(this.beatCounter));
      this.nextBeatTime += secondsPerBeat;
    }

    this.timerId = window.setTimeout(() => this.schedule(), 25);
  }

  public start(): void {
    if (this.isRunning) return;

    const ctx = this.initAudioContext();
    this.isRunning = true;
    this.beatCounter = 0;
    this.nextBeatTime = ctx.currentTime + 0.05;
    this.schedule();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}

export const rcpMetronome = new RcpMetronome();
