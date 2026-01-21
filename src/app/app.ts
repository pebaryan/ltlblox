import { Component, effect, signal, viewChild, AfterViewInit } from '@angular/core';
import { NgxThreeModule, ThOrbitControls, ThPerspectiveCamera } from 'ngx-three';
import { SceneOrchestrator } from './components/scene-orchestrator/scene-orchestrator';
import { TraceEditor } from './components/trace-editor/trace-editor';
import { PlaybackControl } from './components/playback-control/playback-control';
import { currentTime } from './state/formula';
import * as THREE from 'three';
import { LogicPalette } from './components/logic-palette/logic-palette';

@Component({
  selector: 'app-root',
  imports: [NgxThreeModule, SceneOrchestrator, TraceEditor, PlaybackControl, LogicPalette],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  protected readonly title = signal('ltlblox');
  readonly orbitControls = viewChild.required(ThOrbitControls);
  readonly camera = viewChild.required(ThPerspectiveCamera);

  ngAfterViewInit() {
    const controls = this.orbitControls().objRef;
    const cam = this.camera().objRef;
    if (controls && cam) {
      controls.object = cam;
      controls.update();
    }
  }

  constructor() {
    effect(() => {
      const t = currentTime();
      const controls = this.orbitControls()?.objRef;
      const cam = this.camera()?.objRef;

      if (controls && cam) {
        const offset = new THREE.Vector3().copy(cam.position).sub(controls.target);
        controls.target.set(t, 0, 0);
        cam.position.set(t + offset.x, offset.y, offset.z);
        controls.update();
      }
    });
  }
}
