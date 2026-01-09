import { Component, computed, signal } from '@angular/core';
import { currentTime } from '../../state/formula';
import { traceState } from '../../state/trace';

@Component({
  selector: 'app-playback-control',
  imports: [],
  templateUrl: './playback-control.html',
  styleUrl: './playback-control.scss',
})
export class PlaybackControl {
  public currentTime = currentTime;
  public traceLength = computed(() => traceState().length);

  time = currentTime;
  maxTime = () => traceState().length;
  isPlaying = signal(false);
  private intervalId: any;

  togglePlay() {
    this.isPlaying.set(!this.isPlaying());
    if (this.isPlaying()) {
      this.intervalId = setInterval(() => this.next(), 1000);
    } else {
      clearInterval(this.intervalId);
    }
  }

  next() {
    const nextTime = (this.time() + 1) % this.maxTime();
    this.time.set(nextTime);
  }

  prev() {
    const prevTime = this.time() === 0 ? this.maxTime() - 1 : this.time() - 1;
    this.time.set(prevTime);
  }

  // playback-controls.component.ts
  onSliderChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    currentTime.set(parseInt(value, 10));
  }

  stepForward() {
    if (currentTime() < this.traceLength() - 1) {
      currentTime.update((t) => t + 1);
    }
  }

  stepBack() {
    if (currentTime() > 0) {
      currentTime.update((t) => t - 1);
    }
  }
}
