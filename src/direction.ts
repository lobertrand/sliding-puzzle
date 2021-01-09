export class Direction {
  dx: number;
  dy: number;

  private constructor(dx: number, dy: number) {
    this.dx = dx;
    this.dy = dy;
  }

  static UP = new Direction(0, -1);
  static DOWN = new Direction(0, 1);
  static LEFT = new Direction(-1, 0);
  static RIGHT = new Direction(1, 0);

  static all(): Direction[] {
    return [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
  }

  static vertical(): Direction[] {
    return [Direction.UP, Direction.DOWN];
  }

  static horizontal(): Direction[] {
    return [Direction.LEFT, Direction.RIGHT];
  }

  static none(): Direction[] {
    return [];
  }

  static from(dx: number, dy: number): Direction | null {
    for (let dir of this.all()) {
      if (dir.dx === dx && dir.dy === dy) {
        return dir;
      }
    }
    return null;
  }
}
