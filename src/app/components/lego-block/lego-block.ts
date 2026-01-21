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
    if (this.isSatisfied) {
      switch (this.type) {
        case 'PROPOSITION':
          return '#4ade80'; // Green when true
        case 'ALWAYS':
          return '#60a5fa'; // Brighter blue
        case 'EVENTUALLY':
          return '#34d399'; // Brighter green
        case 'NEXT':
          return '#fb923c'; // Brighter orange
        case 'NOT':
          return '#fca5a5'; // Light red
        case 'AND':
          return '#fbbf24'; // Yellow
        case 'OR':
          return '#a78bfa'; // Light purple
        case 'UNTIL':
          return '#22d3ee'; // Cyan
        default:
          return '#e5e7eb'; // Light gray
      }
    }
    switch (this.type) {
      case 'PROPOSITION':
        return '#e63946'; // Red
      case 'ALWAYS':
        return '#457b9d'; // Blue
      case 'EVENTUALLY':
        return '#52b788'; // Green
      case 'NEXT':
        return '#f4a261'; // Orange
      case 'NOT':
        return '#f87171'; // Red
      case 'AND':
        return '#f59e0b'; // Amber
      case 'OR':
        return '#8b5cf6'; // Purple
      case 'UNTIL':
        return '#06b6d4'; // Cyan
      default:
        return '#adb5bd'; // Gray
    }
  });
}
