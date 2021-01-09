import { Block } from "./block";
import { Direction } from "./direction";
import { constrain, lerp, runAnimation } from "./utils";

const CALLBACK_NAMES = [
  "moveStart",
  "moveEnd",
  "fullMoveEnd",
  "animation",
] as const;

type CallbackName = typeof CALLBACK_NAMES[number];
type BlockConsumer = (block: Block) => void;
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
  blocks: Block[] = [];
  selectedBlock: Block;
  animate: boolean;
  animationDuration?: number;
  color: string;
  imageElement: HTMLImageElement;
  imagePath: string;

  private _callbacks: Map<CallbackName, BlockConsumer[]> = new Map(
    CALLBACK_NAMES.map((name) => [name, []])
  );
  private _pressedPoint: Point;
  private _savedPositions: Map<Block, Point>;
  private _animationRunning: boolean = false;
  private _movesSincePressed: number = 0;

  constructor({
    cols = 6,
    rows = 6,
    animate = true,
    animationDuration = 60,
    color,
    image,
  }: BoardParameters = {}) {
    this.cols = cols;
    this.rows = rows;
    this.animate = animate;
    this.animationDuration = animationDuration;
    this.color = color;

    if (image) {
      if (typeof image === "string") {
        this.imageElement = document.createElement("img");
        this.imageElement.src = image;
        this.imagePath = image;
      } else if (image instanceof HTMLImageElement) {
        this.imageElement = image;
        this.imagePath = this.imageElement.src;
      }
    }
  }

  savePositions() {
    this._savedPositions = new Map<Block, Point>();
    for (let block of this.blocks) {
      this._savedPositions.set(block, { x: block.x, y: block.y });
    }
  }

  restorePositions() {
    for (let block of this.blocks) {
      const { x, y } = this._savedPositions.get(block);
      block.setPosition(x, y);
    }
  }

  addBlock(block: Block) {
    this.blocks.push(block);
  }

  findBlocksByTag(tag: string) {
    return this.blocks.filter((b) => b.tag === tag);
  }

  on(event: CallbackName, callback: (block: Block) => void) {
    // Runtime check
    if (!CALLBACK_NAMES.includes(event)) {
      console.error(
        `'${event}' is not an event of the Board class. ` +
          `Valid events are: ${CALLBACK_NAMES.map((n) => `"${n}"`).join(", ")}.`
      );
      return;
    }
    this._callbacks.get(event).push(callback);
  }

  private _fireEvent(event: CallbackName, block: Block) {
    this._callbacks.get(event).forEach((cb) => cb(block));
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

    this._pressedPoint = { x, y };

    const block = this.blockAtCoord(x, y);
    if (block) {
      this.selectedBlock = block;
    }

    this._movesSincePressed = 0;
  }

  mouseDragged(x: number, y: number) {
    if (!this._pressedPoint || !this.selectedBlock) {
      return;
    }
    x = Math.floor(x);
    y = Math.floor(y);

    const draggedX = x - this._pressedPoint.x;
    const draggedY = y - this._pressedPoint.y;

    const diffX = Math.round(draggedX);
    const diffY = Math.round(draggedY);

    if (diffX === 0 && diffY === 0) {
      return;
    }

    // Choosing between a horizontal or vertical move, constrained to 1 unit
    let dx = 0;
    let dy = 0;
    if (Math.abs(draggedX) > Math.abs(draggedY)) {
      dx = constrain(diffX, -1, 1);
    } else {
      dy = constrain(diffY, -1, 1);
    }

    let direction = Direction.from(dx, dy);
    if (direction) {
      if (this.tryMoveSelectedBlock(direction)) {
        // if I move the selected block by (dx, 0) or (dy, 0), I must
        // move 'this.pressedPoint' towards the same direction
        this._pressedPoint.x += dx;
        this._pressedPoint.y += dy;
      }
    } else {
      console.warn("direction is null (should't be)");
    }
  }

  mouseReleased() {
    if (this.selectedBlock) {
      if (this._movesSincePressed > 0 || this._animationRunning) {
        this._fireEvent("fullMoveEnd", this.selectedBlock);
      }
      this.selectedBlock = null;
    }
  }

  tryMoveSelectedBlock(direction: Direction) {
    if (this._animationRunning || !this.selectedBlock) {
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

      this._animationRunning = true;
      this._fireEvent("moveStart", this.selectedBlock);
      runAnimation({
        duration: this.animationDuration,
        onFrame: (progress) => {
          animatedBlock.x = lerp(x, x + dx, progress);
          animatedBlock.y = lerp(y, y + dy, progress);
          this._fireEvent("animation", animatedBlock);
        },
        onEnd: () => {
          this._animationRunning = false;
          this._movesSincePressed += 1;
          this._fireEvent("moveEnd", animatedBlock);
        },
      });
    } else {
      // Without animation
      this._fireEvent("moveStart", this.selectedBlock);
      this.selectedBlock.move(direction);
      this._movesSincePressed += 1;
      this._fireEvent("moveEnd", this.selectedBlock);
    }

    return true;
  }
}
