namespace SlidingPuzzle {
  interface Point {
    x: number;
    y: number;
  }

  export interface BoardParameters {
    cols?: number;
    rows?: number;
    animate?: boolean;
    animationDuration?: number;
    color?: string;
    image?: string | HTMLImageElement;
  }

  export class Board {
    cols: number;
    rows: number;
    blocks: Block[];
    selectedBlock: Block;
    pressedPoint: Point;
    animate: boolean;
    animationDuration?: number;
    animationRunning: boolean;
    color: string;
    imageElement: HTMLImageElement;
    callbacks: {
      [key: string]: ((block: Block) => void)[];
      move: ((block: Block) => void)[];
      continuousMove: ((block: Block) => void)[];
      animation: ((block: Block) => void)[];
    };
    savedPositions: Map<Block, Point>;
    movesSincePressed: number;

    constructor({
      cols = 6,
      rows = 6,
      animate = true,
      animationDuration = 70,
      color = null,
      image = null,
    }: BoardParameters = {}) {
      this.cols = cols;
      this.rows = rows;
      this.blocks = [];
      this.selectedBlock = null;
      this.pressedPoint = null;
      this.animate = animate;
      this.animationDuration = animationDuration;
      this.animationRunning = false;
      this.color = color;

      if (typeof image === "string") {
        this.imageElement = document.createElement("img");
        this.imageElement.src = image;
      } else if (image instanceof HTMLImageElement) {
        this.imageElement = image;
      }

      this.callbacks = {
        move: [],
        continuousMove: [],
        animation: [],
      };
      this.savedPositions = null;
    }

    savePositions() {
      this.savedPositions = new Map<Block, Point>();
      for (let block of this.blocks) {
        this.savedPositions.set(block, { x: block.x, y: block.y });
      }
    }

    restorePositions() {
      for (let block of this.blocks) {
        const { x, y } = this.savedPositions.get(block);
        block.setPosition(x, y);
      }
    }

    addBlock(block: Block) {
      this.blocks.push(block);
    }

    findBlocksByTag(tag: string) {
      return this.blocks.filter((b) => b.tag === tag);
    }

    on(event: string, callback: (block: Block) => void) {
      if (this.callbacks[event] === undefined) {
        console.warn(
          `'${event}' is not an event of the Board class. ` +
            `Valid events are ${Object.keys(this.callbacks).join(", ")}.`
        );
        return;
      }
      this.callbacks[event].push(callback);
    }

    private fireEvent(
      event: "move" | "continuousMove" | "animation",
      block: Block
    ) {
      this.callbacks[event].forEach((cb) => cb(block));
    }

    blockAtCoord(x: number, y: number) {
      for (let block of this.blocks) {
        if (block.selectable && block.containsCoord(x, y)) {
          return block;
        }
      }
      return null;
    }

    // Mouse pressed on a block : select this block
    // Mouse dragged to another point : this point is the target that the selected block must follow, one step by one, each step taking the same amount of time.
    // Reference for the animation of the movements : https://www.youtube.com/watch?v=aJzu2rblcYg&ab_channel=GameLoc

    mousePressed(x: number, y: number) {
      x = Math.floor(x);
      y = Math.floor(y);

      this.pressedPoint = { x, y };

      const block = this.blockAtCoord(x, y);
      if (block) {
        this.selectedBlock = block;
      }

      this.movesSincePressed = 0;
    }

    mouseDragged(x: number, y: number) {
      if (!this.pressedPoint || !this.selectedBlock) {
        return;
      }
      x = Math.floor(x);
      y = Math.floor(y);

      const draggedX = x - this.pressedPoint.x;
      const draggedY = y - this.pressedPoint.y;

      const diffX = Math.round(draggedX);
      const diffY = Math.round(draggedY);

      if (diffX === 0 && diffY === 0) {
        return;
      }

      // Choosing between a horizontal or vertical move, constrained to 1 unit
      let dx = 0;
      let dy = 0;
      if (Math.abs(draggedX) > Math.abs(draggedY)) {
        dx = Utils.constrain(diffX, -1, 1);
      } else {
        dy = Utils.constrain(diffY, -1, 1);
      }

      let direction = Direction.from(dx, dy);
      if (direction !== null) {
        if (this.tryMoveSelectedBlock(direction)) {
          // if I move the selected block by (dx, 0) or (dy, 0), I must
          // move 'this.pressedPoint' towards the same direction
          this.pressedPoint.x += dx;
          this.pressedPoint.y += dy;
        }
      } else {
        console.warn("direction is null (should't be)");
      }
    }

    mouseReleased() {
      if (this.selectedBlock !== null) {
        if (this.movesSincePressed > 0 || this.animationRunning) {
          this.fireEvent("continuousMove", this.selectedBlock);
        }
        this.selectedBlock = null;
      }
    }

    tryMoveSelectedBlock(direction: Direction) {
      if (this.animationRunning || !this.selectedBlock) {
        return false;
      }

      // Checking if direction if allowed for this block
      if (!this.selectedBlock.possibleMoves.includes(direction)) {
        return false;
      }

      // Checking if move is valid
      const { dx, dy } = direction;
      for (let other of this.blocks) {
        if (
          other !== this.selectedBlock &&
          other.overlapsWith(this.selectedBlock, dx, dy) &&
          this.selectedBlock.cannotOverlapWith(other)
        ) {
          return false;
        }
      }

      if (this.animate) {
        // With animation
        const { x, y } = this.selectedBlock;
        const animatedBlock = this.selectedBlock;

        this.animationRunning = true;
        SlidingPuzzle.Utils.runAnimation({
          duration: this.animationDuration,
          onFrame: (progress) => {
            animatedBlock.x = Utils.lerp(x, x + dx, progress);
            animatedBlock.y = Utils.lerp(y, y + dy, progress);
            this.callbacks.animation.forEach((cb) => cb(animatedBlock));
          },
          onEnd: () => {
            this.animationRunning = false;
            this.movesSincePressed += 1;
            this.fireEvent("move", animatedBlock);
          },
        });
      } else {
        // Without animation
        this.selectedBlock.move(direction);
        this.movesSincePressed += 1;
        this.fireEvent("move", this.selectedBlock);
      }

      return true;
    }
  }
}
