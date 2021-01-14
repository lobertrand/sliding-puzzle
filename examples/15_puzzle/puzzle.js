document.addEventListener("DOMContentLoaded", () => {
  const board = new SlidingPuzzle.Board({ cols: 4, rows: 4 });

  for (let i = 0; i < 15; i++) {
    const b = new SlidingPuzzle.Block({
      x: i % 4,
      y: Math.floor(i / 4),
      content: `<p class="number">${i + 1}</p>`,
    });
    board.addBlock(b);
  }

  const container = document.querySelector("#container");
  const renderer = new SlidingPuzzle.HTMLRenderer({ board, container });

  renderer.onMousePressed((x, y) => board.mousePressed(x, y));
  renderer.onMouseDragged((x, y) => board.mouseDragged(x, y));
  renderer.onMouseReleased(() => board.mouseReleased());

  board.on("animation", (block) => renderer.render(block));
});
