namespace spzl {
  type P5Canvas = any;

  export class CanvasDisplay {
    board: Board;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    unit: number;
    width: number;
    height: number;

    constructor(
      board: Board,
      canvas: HTMLCanvasElement | P5Canvas,
      maxWidth: number,
      maxHeight: number
    ) {
      this.board = board;

      const widthRatio = maxWidth / board.cols;
      const heightRatio = maxHeight / board.rows;

      if (widthRatio > heightRatio) {
        this.unit = Math.floor(maxHeight / board.rows);
      } else {
        this.unit = Math.floor(maxWidth / board.cols);
      }

      this.width = board.cols * this.unit;
      this.height = board.rows * this.unit;

      if (this.isP5Canvas(canvas)) {
        const p5Canvas = canvas;
        p5Canvas.width = this.width;
        p5Canvas.heigh = this.height;
        this.canvas = p5Canvas.elt;
      } else if (canvas instanceof HTMLCanvasElement) {
        this.canvas = canvas;
      } else {
        throw new TypeError(
          "canvas parameter should be an HTMLCanvasElement or a p5 canvas."
        );
      }

      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext("2d");
    }

    private isP5Canvas(canvas: any): boolean {
      return (
        canvas.elt !== undefined && canvas.elt.classList.contains("p5Canvas")
      );
    }

    show() {
      if (this.board.imageElement) {
        this.ctx.drawImage(
          this.board.imageElement,
          0,
          0,
          this.board.cols * this.unit,
          this.board.rows * this.unit
        );
      } else {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }

      if (this.board.color !== null) {
        this.ctx.fillStyle = this.board.color;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }

      for (let block of this.board.blocks) {
        this.showBlock(block);
      }
    }

    showBlock(block: Block) {
      const unit = this.unit;

      if (block.color !== null) {
        const inside = unit * 0.8;

        for (let [x, y] of block.shapeCoords()) {
          this.ctx.fillStyle = block.color;
          this.ctx.fillRect(x * unit, y * unit, unit, unit);
          this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
          this.ctx.fillRect(
            x * unit + inside,
            y * unit + inside,
            unit - 2 * inside,
            unit - 2 * inside
          );
        }

        if (block.selectable) {
          // Contour of block
          this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
          this.ctx.lineWidth = unit * 0.04;
          this.ctx.strokeRect(
            block.x * unit,
            block.y * unit,
            block.cols * unit,
            block.rows * unit
          );
        }
      }

      if (block.imageElement != null) {
        this.ctx.drawImage(
          block.imageElement,
          block.x * unit,
          block.y * unit,
          block.cols * unit,
          block.rows * unit
        );
      }
    }
  }
}
