import { JsonPipe } from '@angular/common';
import { Component, computed, effect, input, Input, ViewChild, viewChild } from '@angular/core';
import { NgxThreeModule, ThMesh } from 'ngx-three';
import * as THREE from 'three';

@Component({
  selector: 'app-logic-link',
  standalone: true,
  imports: [NgxThreeModule, JsonPipe],
  templateUrl: './logic-link.html',
  styleUrl: './logic-link.scss',
})
export class LogicLink {
  start = input<[number, number, number]>([0, 0, 0]);
  end = input<[number, number, number]>([0, 0, 0]);

  // tubeArgs = computed(() => {
  //   const [x1, y1, z1] = this.start();
  //   const [x2, y2, z2] = this.end();

  //   // const path = this.pipePath();

  //   // Return the arguments array that TubeGeometry expects
  //   return [path, 64, 0.06, 8, false] as const;
  // });

  // get positionAttr() {
  //   const points = [new THREE.Vector3(...this.start()), new THREE.Vector3(...this.end())];
  //   return new THREE.Float32BufferAttribute(
  //     points.flatMap((p) => [p.x, p.y, p.z]),
  //     3
  //   );
  // }

  // curve = computed(() => {
  //   const [x1, y1, z1] = this.start();
  //   const [x2, y2, z2] = this.end();

  //   // Create a path that looks like a pipe with rounded corners
  //   // Point 1: Start (the operator block)
  //   // Point 2: Slightly above the start
  //   // Point 3: Above the target time step
  //   // Point 4: Down to the floor
  //   const path = new THREE.CatmullRomCurve3([
  //     new THREE.Vector3(x1, y1, z1),
  //     new THREE.Vector3(x1, y1 + 0.5, z1),
  //     new THREE.Vector3(x2, y1 + 0.5, z2),
  //     new THREE.Vector3(x2, y2, z2),
  //   ]);

  //   // curveType 'centripetal' helps keep the "staircase" shape without looping
  //   path.curveType = 'centripetal';
  //   return path;
  // });

  // pathKey = computed(() => `${this.start().join(',')}-${this.end().join(',')}`);

  // pipePath = computed(() => {
  //   const [x1, y1, z1] = this.start();
  //   const [x2, y2, z2] = this.end();

  //   // The "Staircase" points
  //   const p1 = new THREE.Vector3(x1, y1, z1);
  //   const p2 = new THREE.Vector3(x2, y1, z1); // Up
  //   const p3 = new THREE.Vector3(x2, y2, z2); // Across
  //   // const p4 = new THREE.Vector3(x2, y2, z2);      // Down

  //   const path = new THREE.CurvePath<THREE.Vector3>();
  //   path.add(new THREE.LineCurve3(p1, p2));
  //   path.add(new THREE.LineCurve3(p2, p3));
  //   // path.add(new THREE.LineCurve3(p3, p4));

  //   return path;
  // });
  pipeMesh = viewChild<ThMesh>('pipeMesh');

  @ViewChild('pipeMesh') set meshSetter(mesh: ThMesh | undefined) {
    if (mesh) {
      // Wait for the next tick to ensure objRef is attached
      setTimeout(() => this.updateGeometry(mesh.objRef), 0);
    }
  }

  private updateGeometry(mesh: THREE.Mesh | undefined) {
    if (!mesh) return;

    const [x1, y1, z1] = this.start();
    const [x2, y2, z2] = this.end();

    const points = [
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x1, y1 + 0.6, z1),
      new THREE.Vector3(x2, y1 + 0.6, z2),
      new THREE.Vector3(x2, y2, z2),
    ];

    const curve = new THREE.CatmullRomCurve3(points);
    curve.curveType = 'catmullrom';
    curve.tension = 0;

    if (mesh.geometry) mesh.geometry.dispose();
    mesh.geometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
  }

  constructor() {
    // This effect runs whenever tubeArgs() changes
    effect(() => {
      // const meshComponent = this.pipeMesh();
      // const mesh = meshComponent?.objRef;
      // if (mesh) {
      //   this.updateGeometry(mesh);
      // }
      const [x1, y1, z1] = this.start();
      const [x2, y2, z2] = this.end();

      const meshComponent = this.pipeMesh();
      const mesh = meshComponent?.objRef;

      if (mesh) {
        const zOffset = (x2 - x1) * 0.02;
        const points = [
          new THREE.Vector3(x1, y1, z1),
          new THREE.Vector3(x1, y1 + 0.6, z1 + zOffset),
          new THREE.Vector3(x2, y1 + 0.6, z2 + zOffset),
          new THREE.Vector3(x2, y2, z2),
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        curve.curveType = 'catmullrom';
        curve.tension = 0;
        // 1. Dispose old geometry to prevent memory leaks
        mesh.geometry.dispose();

        // 2. Create brand new geometry from new path
        mesh.geometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);

        // 3. Mark for update
        // mesh.geometry.attributes['position'].needsUpdate = true;
      } else {
        // If mesh is not ready, we need to check again.
        // In Zoneless, we can force a tiny delay or
        // rely on the next change detection cycle.
        window.setTimeout(() => {
          // Trigger a dummy change to re-run this effect
          // or manually call a refresh function.
        });
      }
    });
  }

  private updateUntilGeometry(mesh: THREE.Mesh) {
    const [x1, y1, z1] = this.start();
    const [targetX] = this.end(); // The moment Q becomes true

    const points: THREE.Vector3[] = [];

    // Create a path that "walks" along the timeline from current time to target
    for (let i = x1; i <= targetX; i++) {
      points.push(new THREE.Vector3(i, y1 + 0.6, z1));
    }

    // If it's a single point, we just show a small connector
    if (points.length < 2) {
      points.push(new THREE.Vector3(x1 + 0.1, y1 + 0.6, z1));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    // Using 'catmullrom' with tension 0 for straight industrial segments
    curve.curveType = 'catmullrom';
    curve.tension = 0;

    mesh.geometry.dispose();
    mesh.geometry = new THREE.TubeGeometry(curve, 64, 0.07, 8, false);
  }
}
