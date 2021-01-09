namespace SlidingPuzzle {
  interface Proportions {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export class HTMLRenderer {
    board: Board;
    proportions: Proportions;
    parentElement: HTMLElement;
    backgroundDiv: HTMLDivElement;
    boardDiv: HTMLDivElement;
    blockDivs: Map<Block, HTMLDivElement>;
    mouseIsPressed: boolean;

    constructor({
      board,
      parentElement,
      proportions,
      backgroundImage,
    }: {
      board: Board;
      parentElement: HTMLElement;
      proportions: Proportions;
      backgroundImage: HTMLImageElement;
    }) {
      this.board = board;
      this.proportions = proportions;
      this.parentElement = parentElement;

      // Background
      this.backgroundDiv =
        this.parentElement.querySelector("div.background") ||
        document.createElement("div");
      this.parentElement.appendChild(this.backgroundDiv);
      this.parentElement.style.display = "grid";

      const resize = () => {
        const bounds = this.parentElement.getBoundingClientRect();
        const bgRatio = backgroundImage.width / backgroundImage.height;
        const boundsRatio = bounds.width / bounds.height;
        let w = 1,
          h = 1;
        if (boundsRatio > bgRatio) {
          w = bgRatio / boundsRatio;
        } else {
          h = boundsRatio / bgRatio;
        }
        this.backgroundDiv.style.width = w * 100 + "%";
        this.backgroundDiv.style.height = h * 100 + "%";
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(this.parentElement);

      this.backgroundDiv.style.position = "relative";
      this.backgroundDiv.style.margin = "auto";
      this.backgroundDiv.classList.add("background");

      if (board.color) {
        this.backgroundDiv.style.backgroundColor = board.color;
      }
      if (backgroundImage) {
        this._applyBackground(this.backgroundDiv, backgroundImage.src);
      }

      // Puzzle
      this.boardDiv =
        this.backgroundDiv.querySelector("div.board") ||
        document.createElement("div");
      this.backgroundDiv.appendChild(this.boardDiv);
      this.boardDiv.style.position = "absolute";
      this._applyProportions(this.boardDiv, proportions);
      this.boardDiv.classList.add("board");

      // Blocks
      this.blockDivs = new Map(); // Map<Block, Element>

      for (let block of board.blocks) {
        const div = document.createElement("div");
        this.blockDivs.set(block, div);
        div.classList.add("block");
        if (block.selectable) {
          div.classList.add("selectable");
        }
        div.style.position = "absolute";

        this._applyProportions(div, {
          x: block.x / board.cols,
          y: block.y / board.rows,
          width: block.cols / board.cols,
          height: block.rows / board.rows,
        });

        if (block.color) {
          div.style.backgroundColor = block.color;
        }
        if (block.imagePath) {
          this._applyBackground(div, block.imagePath);
        }

        this.boardDiv.appendChild(div);
      }

      this.mouseIsPressed = false;
    }

    _applyProportions(element: HTMLElement, proportions: Proportions) {
      element.style.width = proportions.width * 100 + "%";
      element.style.height = proportions.height * 100 + "%";
      element.style.left = proportions.x * 100 + "%";
      element.style.top = proportions.y * 100 + "%";
    }

    _applyBackground(element: HTMLElement, imageSource: string) {
      element.style.backgroundImage = `url("${imageSource}")`;
      element.style.backgroundSize = "contain";
      element.style.backgroundRepeat = "no-repeat";
    }

    _callbackMouseCoord(event: MouseEvent | TouchEvent) {
      const rect = this.boardDiv.getBoundingClientRect();

      let pos: { x: number; y: number };
      if (event instanceof MouseEvent) {
        pos = { x: event.clientX, y: event.clientY };
      } else {
        pos = { x: event.touches[0].pageX, y: event.touches[0].pageY };
      }

      const x = ((pos.x - rect.left) / rect.width) * this.board.cols; // [0..cols]
      const y = ((pos.y - rect.top) / rect.height) * this.board.rows; // [0..rows]

      return { x, y };
    }

    onMousePressed(callback: (x: number, y: number) => void) {
      const handler = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        this.mouseIsPressed = true;
        const { x, y } = this._callbackMouseCoord(e);
        callback(x, y);
      };
      this.boardDiv.addEventListener("mousedown", handler);
      this.boardDiv.addEventListener("touchstart", handler);
    }

    onMouseDragged(callback: (x: number, y: number) => void) {
      const handler = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        if (this.mouseIsPressed) {
          const { x, y } = this._callbackMouseCoord(e);
          callback(x, y);
        }
      };
      this.boardDiv.addEventListener("mousemove", handler);
      this.boardDiv.addEventListener("touchmove", handler);
    }

    onMouseReleased(callback: () => void) {
      const handler = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        callback();
        this.mouseIsPressed = false;
      };
      // Event is placed on the <body> element to handle the case where the
      // player releases the mouse outside de puzzle board.
      document.body.addEventListener("mouseup", (e) => handler(e));
      document.body.addEventListener("touchend", (e) => handler(e));
    }

    render(block: Block = null) {
      if (block) {
        const div = this.blockDivs.get(block);
        div.style.left = (block.x / this.board.cols) * 100 + "%";
        div.style.top = (block.y / this.board.rows) * 100 + "%";
      } else {
        for (let block of this.board.blocks) {
          this.render(block);
        }
      }
    }
  }
}
