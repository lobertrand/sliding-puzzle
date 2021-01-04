namespace spzl {
  export interface BlockParameters {
    shape?: number[][];
    cols?: number;
    rows?: number;
    x?: number;
    y?: number;
    possibleMoves?: Direction[];
    possibleOverlaps?: Block[];
    selectable?: boolean;
    color?: string;
    image?: string | HTMLImageElement;
    tag?: string;
  }

  export class Block {
    shape: number[][] = [[1]];
    cols: number = 0;
    rows: number = 0;
    x: number;
    y: number;
    possibleMoves: Direction[];
    possibleOverlaps: Block[];
    selectable: boolean;
    color: string;
    // image: (string | HTMLImageElement);
    imageElement: HTMLImageElement;
    tag: string;

    constructor({
      shape = [[1]],
      x = 0,
      y = 0,
      possibleMoves = Direction.none(),
      possibleOverlaps = [],
      selectable = true,
      color = null,
      image = null,
      tag = null,
    }: BlockParameters = {}) {
      this.shape = shape;
      this.cols = this.shape.reduce(
        (acc, curr) => Math.max(acc, curr.length),
        0
      );
      this.rows = this.shape.length;
      this.x = x;
      this.y = y;
      this.possibleMoves = possibleMoves;
      this.possibleOverlaps = possibleOverlaps;
      this.selectable = selectable;
      this.color = color;
      // this.image = image;

      if (typeof image === "string") {
        this.imageElement = document.createElement("img");
        this.imageElement.src = image;
      } else if (image instanceof HTMLImageElement) {
        this.imageElement = image;
      }

      this.tag = tag;
    }

    *shapeCoords(): Generator<[number, number], void, void> {
      for (let y = 0; y < this.shape.length; y++) {
        for (let x = 0; x < this.shape[y].length; x++) {
          if (this.shape[y][x] === 1) {
            yield [this.x + x, this.y + y];
          }
        }
      }
    }

    containsCoord(x: number, y: number) {
      for (let [bx, by] of this.shapeCoords()) {
        if (x === bx && y === by) {
          return true;
        }
      }
      return false;
    }

    move(direction: Direction) {
      this.x += direction.dx;
      this.y += direction.dy;
    }

    setPosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    cannotOverlapWith(other: Block) {
      return !this.possibleOverlaps.includes(other);
    }

    overlapsWith(other: Block, dx = 0, dy = 0) {
      for (let [x, y] of this.shapeCoords()) {
        for (let [ox, oy] of other.shapeCoords()) {
          if (x === ox + dx && y === oy + dy) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
