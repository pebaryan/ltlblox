import { Component, Input, computed } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';

@Component({
  selector: 'app-lego-block',
  imports: [NgxThreeModule],
  templateUrl: './lego-block.html',
  styleUrl: './lego-block.scss',
})
export class LegoBlock {
  @Input() pos: [number, number, number] = [0, 0, 0];
  @Input() type: string = 'PROPOSITION';
  @Input() isSatisfied: boolean = false;

  _color = computed(() => {
    switch (this.type) {
      case 'PROPOSITION':
        return '#e63946'; // Red
      case 'ALWAYS':
        return '#457b9d'; // Blue
      case 'EVENTUALLY':
        return '#52b788'; // Green
      case 'NEXT':
        return '#f4a261'; // Orange
      default:
        return '#adb5bd'; // Gray
    }
  });
}
