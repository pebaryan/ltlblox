import { Component, signal, effect } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';
import { traceState } from '../../state/trace';
import { currentTime } from '../../state/formula';

@Component({
  selector: 'app-timeline-rail',
  standalone: true,
  imports: [NgxThreeModule],
  templateUrl: './timeline-rail.html',
  styleUrl: './timeline-rail.scss',
})
export class TimelineRail {
  public traceState = traceState;
  public currentTime = currentTime;

  railLength = signal(traceState().length);
  railCenter = signal((traceState().length - 1) / 2);
  traceLength = signal(traceState().length);

  constructor() {
    effect(() => {
      const len = traceState().length;
      this.railLength.set(len + 1);
      this.railCenter.set((len - 1) / 2);
      this.traceLength.set(len);
    });
  }
}
