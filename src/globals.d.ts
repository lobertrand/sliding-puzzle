declare class ResizeObserver {
  constructor(enventHandler: (...args: any) => void);

  observe(element: HTMLElement): void;
}
