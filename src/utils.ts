namespace SlidingPuzzle.Utils {
  export interface Dimension {
    width: number;
    height: number;
  }
  export function constrain(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
  }

  export function lerp(start: number, stop: number, amount: number): number {
    return amount * (stop - start) + start;
  }

  export function fitInBounds(board: Board, bounds: Dimension): Dimension {
    const unit = Math.floor(
      Math.min(bounds.width / board.cols, bounds.height / board.rows)
    );
    const width = board.cols * unit;
    const height = board.rows * unit;
    return { width, height };
  }

  export function runAnimation({
    duration = 100,
    timingFunction = (t) => t,
    onFrame,
    onEnd,
  }: {
    duration?: number;
    timingFunction?: (timeFraction: number) => number;
    onFrame?: (progress: number) => void;
    onEnd?: () => void;
  } = {}) {
    // Inspired from https://javascript.info/js-animation

    let startTime: number;
    requestAnimationFrame(function run(currentTime) {
      if (startTime === undefined) {
        startTime = currentTime;
      }

      const ellapsedMillis = currentTime - startTime;
      let timeFraction = ellapsedMillis / duration; // [0..1]
      if (timeFraction > 1) {
        timeFraction = 1;
      }

      // calculate the current animation state
      const progress = timingFunction(timeFraction);

      if (onFrame) {
        onFrame(progress);
      }

      if (timeFraction < 1) {
        requestAnimationFrame(run);
      } else {
        if (onEnd) {
          onEnd();
        }
      }
    });
  }
}
