import { Component, Input, computed, OnChanges, SimpleChanges } from '@angular/core';
import { NgxThreeModule } from 'ngx-three';
import * as THREE from 'three';
import { propositionWidth, blockHeight } from '../../core/formula-utils';

function createTextTexture(text: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 48;
  const font = `bold ${fontSize}px Arial`;
  
  ctx!.font = font;
  const metrics = ctx!.measureText(text);
  const textWidth = metrics.width;
  
  canvas.width = textWidth + 16;
  canvas.height = fontSize + 16;
  
  ctx!.font = font;
  ctx!.fillStyle = 'white';
  ctx!.textAlign = 'center';
  ctx!.textBaseline = 'middle';
  ctx!.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

@Component({
  selector: 'app-lego-block',
  imports: [NgxThreeModule],
  templateUrl: './lego-block.html',
  styleUrl: './lego-block.scss',
})
export class LegoBlock implements OnChanges {
  @Input() pos: [number, number, number] = [0, 0, 0];
  @Input() type: string = 'PROPOSITION';
  @Input() variableId?: string;
  @Input() isSatisfied: boolean = false;
  @Input() shape: 'box' | 'unary' | 'binary' = 'box';
  @Input() width: number = 1.3;
  @Input() childZ?: number[];
  @Input() childWidth?: number;

  labelTexture = new THREE.Texture();
  readonly blockHeight = blockHeight;
  readonly blockWidth = propositionWidth;

  constructor() {
    this.updateLabelTexture();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['type'] || changes['variableId']) {
      this.updateLabelTexture();
    }
  }

  private updateLabelTexture() {
    let text = '';
    switch (this.type) {
      case 'PROPOSITION':
        text = this.variableId || 'p';
        break;
      case 'ALWAYS':
        text = '□';
        break;
      case 'EVENTUALLY':
        text = '◇';
        break;
      case 'NEXT':
        text = '○';
        break;
      case 'NOT':
        text = '¬';
        break;
      case 'AND':
        text = '∧';
        break;
      case 'OR':
        text = '∨';
        break;
      case 'UNTIL':
        text = '𝒰';
        break;
      default:
        text = '?';
    }
    this.labelTexture = createTextTexture(text);
  }

  _color = computed(() => {
    if (this.isSatisfied) {
      switch (this.type) {
        case 'PROPOSITION':
          return '#4ade80';
        case 'ALWAYS':
          return '#60a5fa';
        case 'EVENTUALLY':
          return '#34d399';
        case 'NEXT':
          return '#fb923c';
        case 'NOT':
          return '#fca5a5';
        case 'AND':
          return '#fbbf24';
        case 'OR':
          return '#a78bfa';
        case 'UNTIL':
          return '#22d3ee';
        default:
          return '#e5e7eb';
      }
    }
    switch (this.type) {
      case 'PROPOSITION':
        return '#e63946';
      case 'ALWAYS':
        return '#457b9d';
      case 'EVENTUALLY':
        return '#52b788';
      case 'NEXT':
        return '#f4a261';
      case 'NOT':
        return '#f87171';
      case 'AND':
        return '#f59e0b';
      case 'OR':
        return '#8b5cf6';
      case 'UNTIL':
        return '#06b6d4';
      default:
        return '#adb5bd';
    }
  });
}
