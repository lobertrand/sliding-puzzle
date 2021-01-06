namespace SlidingPuzzle {
  type P5Canvas = any;

  export class CanvasRenderer {
    board: Board;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    unit: number;

    constructor({
      board,
      canvas,
      dimension,
    }: {
      board: Board;
      canvas?: P5Canvas | HTMLCanvasElement;
      dimension?: Utils.Dimension;
    }) {
      this.board = board;

      if (!canvas && !dimension) {
        throw new Error(
          "You may pass a 'canvas' or a 'dimension' or both as parameters."
        );
      }

      if (!canvas) {
        this.canvas = document.createElement("canvas");
      } else if (canvas.elt && canvas.elt.classList.contains("p5Canvas")) {
        this.canvas = canvas.elt;
      } else if (canvas instanceof HTMLCanvasElement) {
        this.canvas = canvas;
      } else {
        throw new TypeError(
          "'canvas' parameter should be an HTMLCanvasElement or a p5 canvas."
        );
      }

      if (!dimension) {
        this.canvas.width = dimension.width;
        this.canvas.height = dimension.height;
      }

      this.unit = this.canvas.width / this.board.cols;
      this.ctx = this.canvas.getContext("2d");
    }

    get width(): number {
      return this.canvas.width;
    }

    get height(): number {
      return this.canvas.height;
    }

    render() {
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
        this.renderBlock(block);
      }
    }

    renderBlock(block: Block) {
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
