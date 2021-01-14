import { Direction } from "./direction";
import { P5Canvas } from "./globals";

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
  image?: string | HTMLImageElement | P5Canvas;
  name?: string;
  content?: any;
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
  imageElement: HTMLImageElement;
  imagePath: string;
  name: string;
  content: any;

  constructor({
    shape = [[1]],
    x = 0,
    y = 0,
    possibleMoves = Direction.all(),
    possibleOverlaps = [],
    selectable = true,
    color,
    image,
    name,
    content,
  }: BlockParameters = {}) {
    this.shape = shape;
    this.cols = this.shape.reduce((acc, curr) => Math.max(acc, curr.length), 0);
    this.rows = this.shape.length;
    this.x = x;
    this.y = y;
    this.possibleMoves = possibleMoves;
    this.possibleOverlaps = possibleOverlaps;
    this.selectable = selectable;
    this.color = color;
    this.name = name;
    this.content = content;

    if (image) {
      if (typeof image === "string") {
        this.imageElement = Block._urlToImage(image);
        this.imagePath = image;
      } else if (image instanceof HTMLImageElement) {
        this.imageElement = image;
        this.imagePath = this.imageElement.src;
      } else if ((image as P5Canvas).elt) {
        const url = image.elt.toDataURL();
        this.imageElement = Block._urlToImage(url);
        this.imageElement.width = image.elt.width;
        this.imageElement.height = image.elt.height;
        this.imagePath = this.imageElement.src;
      }
    }
  }

  private static _urlToImage(url: string): HTMLImageElement {
    const image = new Image();
    image.onerror = () => {
      throw new Error(`Error on image "${url}".`);
    };
    image.src = url;
    return image;
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
