import { Component, signal } from '@angular/core';
import { currentTime, traceState } from '../../state/formula';

@Component({
  selector: 'app-playback-control',
  imports: [],
  templateUrl: './playback-control.html',
  styleUrl: './playback-control.scss',
})
export class PlaybackControl {
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
}
