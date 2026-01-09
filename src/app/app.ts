import { Component, effect, signal, viewChild } from '@angular/core';
import { NgxThreeModule, ThOrbitControls } from 'ngx-three';
import { SceneOrchestrator } from './components/scene-orchestrator/scene-orchestrator';
import { TraceEditor } from './components/trace-editor/trace-editor';
import { PlaybackControl } from './components/playback-control/playback-control';
import { currentTime } from './state/formula';
import * as THREE from 'three';
import { LogicPalette } from "./components/logic-palette/logic-palette";

@Component({
  selector: 'app-root',
  imports: [NgxThreeModule, SceneOrchestrator, TraceEditor, PlaybackControl, LogicPalette],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('ltlblox');
  readonly orbitControls = viewChild(ThOrbitControls);

  constructor() {
    effect(() => {
      const t = currentTime();
      const controls = this.orbitControls()?.objRef;

      if (controls) {
        // Calculate the offset (how far the camera was from the old target)
        const offset = new THREE.Vector3().copy(controls.object.position).sub(controls.target);

        // Update the target to the new time step
        controls.target.set(t, 0, 0);

        // Shift the camera by the same amount so the angle stays identical
        controls.object.position.set(t + offset.x, offset.y, offset.z);

        controls.update();
      }
    });
  }
}
