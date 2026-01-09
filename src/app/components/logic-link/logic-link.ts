import { Component, computed, Input } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';
import * as THREE from 'three';

@Component({
  selector: 'app-logic-link',
  standalone: true,
  imports: [NgxThreeModule],
  templateUrl: './logic-link.html',
  styleUrl: './logic-link.scss',
})
export class LogicLink {
  @Input() start: [number, number, number] = [0, 0, 0];
  @Input() end: [number, number, number] = [0, 0, 0];

  get positionAttr() {
    const points = [new THREE.Vector3(...this.start), new THREE.Vector3(...this.end)];
    return new THREE.Float32BufferAttribute(
      points.flatMap((p) => [p.x, p.y, p.z]),
      3
    );
  }

  curve = computed(() => {
    const [x1, y1, z1] = this.start;
    const [x2, y2, z2] = this.end;

    // Create a path that looks like a pipe with rounded corners
    // Point 1: Start (the operator block)
    // Point 2: Slightly above the start
    // Point 3: Above the target time step
    // Point 4: Down to the floor
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x1, y1 + 0.5, z1), 
      new THREE.Vector3(x2, y1 + 0.5, z2),
      new THREE.Vector3(x2, y2, z2)
    ]);
    
    // curveType 'centripetal' helps keep the "staircase" shape without looping
    path.curveType = 'centripetal'; 
    return path;
  });

  pipePath = computed(() => {
    const [x1, y1, z1] = this.start;
    const [x2, y2, z2] = this.end;
    
    // The "Staircase" points
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x1, y1 + 0.6, z1); // Up
    const p3 = new THREE.Vector3(x2, y1 + 0.6, z2); // Across
    const p4 = new THREE.Vector3(x2, y2, z2);      // Down

    const path = new THREE.CurvePath<THREE.Vector3>();
    path.add(new THREE.LineCurve3(p1, p2));
    path.add(new THREE.LineCurve3(p2, p3));
    path.add(new THREE.LineCurve3(p3, p4));
    
    return path;
  });
}
