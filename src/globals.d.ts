declare global {
  export class ResizeObserver {
    constructor(enventHandler: (...args: any) => void);

    observe(element: HTMLElement): void;
  }
}

export interface Dimension {
  width: number;
  height: number;
}

export interface P5Canvas {
  elt: HTMLCanvasElement;
}
