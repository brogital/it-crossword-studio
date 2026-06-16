const themes = [
  {
    id: "design",
    title: "Design / UX",
    tab: "Design",
    description: "Interface, research, accessibility, and visual system vocabulary for product designers and frontend teams.",
    entries: [
      ["PROTOTYPE", "A quick working or visual version of an idea before full development."],
      ["WIREFRAME", "A low-detail layout that shows structure before visual design."],
      ["USABILITY", "How easy and clear a product is for people to use."],
      ["PERSONA", "A fictional user profile based on research."],
      ["JOURNEY", "The sequence of steps a user takes to reach a goal."],
      ["ACCESSIBLE", "Designed so people with different abilities can use it."],
      ["COMPONENT", "A reusable piece of interface."],
      ["CONTRAST", "The visual difference that helps text and elements stand out."],
      ["SPACING", "The distance between interface elements."],
      ["FEEDBACK", "A response that tells the user what happened."],
      ["RESEARCH", "The work of learning about users, problems, and behavior."],
      ["FIGMA", "A collaborative design tool used for interface mockups."]
    ]
  },
  {
    id: "development",
    title: "Software Development",
    tab: "Development",
    description: "Everyday engineering language: code, delivery, review, release, and runtime behavior.",
    entries: [
      ["REPOSITORY", "A place where source code and history are stored."],
      ["DEBUGGING", "Finding and fixing problems in code."],
      ["FUNCTION", "A reusable block of logic that can be called."],
      ["VARIABLE", "A named value in a program."],
      ["API", "A contract that lets software systems communicate."],
      ["DEPLOYMENT", "Putting a version of software into an environment."],
      ["PIPELINE", "An automated build, test, and delivery process."],
      ["REFACTOR", "Improve code structure without changing behavior."],
      ["DATABASE", "A system for storing and querying structured data."],
      ["CACHE", "Fast temporary storage used to reduce repeated work."],
      ["TESTING", "Checking that software behaves as expected."],
      ["RELEASE", "A version of software delivered to users."]
    ]
  },
  {
    id: "product",
    title: "Product Management",
    tab: "Product",
    description: "Planning, discovery, goals, prioritization, and decision vocabulary for product teams.",
    entries: [
      ["ROADMAP", "A high-level plan of future product work."],
      ["BACKLOG", "A prioritized list of possible work items."],
      ["METRIC", "A number used to measure product performance."],
      ["HYPOTHESIS", "A testable belief about users or business impact."],
      ["EXPERIMENT", "A structured test of a product change."],
      ["STAKEHOLDER", "A person or group affected by the product."],
      ["PRIORITY", "The relative importance of a problem or task."],
      ["SEGMENT", "A group of users with similar traits or needs."],
      ["VALUE", "The benefit a product gives to users or business."],
      ["OUTCOME", "The result a team wants to achieve."],
      ["DISCOVERY", "Learning what problem to solve before building."],
      ["MVP", "The smallest useful product version for learning."]
    ]
  },
  {
    id: "analytics",
    title: "Analytics",
    tab: "Analytics",
    description: "Data, metrics, joins, dashboards, and interpretation terms for analysts and product teams.",
    entries: [
      ["DASHBOARD", "A visual screen with key metrics and charts."],
      ["COHORT", "A group of users observed over time."],
      ["FUNNEL", "A sequence of steps users pass through before conversion."],
      ["CONVERSION", "The share of users who complete a target action."],
      ["JOINKEY", "A field used to connect rows from two datasets."],
      ["SOURCE", "The original place where data comes from."],
      ["GRAIN", "The level of detail represented by one row."],
      ["DUPLICATE", "A repeated row or record that can distort results."],
      ["QUERY", "A request for data, often written in SQL."],
      ["SAMPLE", "A subset of data used for analysis or checking."],
      ["INSIGHT", "A useful conclusion drawn from data."],
      ["BASELINE", "A reference level used for comparison."]
    ]
  },
  {
    id: "ai",
    title: "AI / Machine Learning",
    tab: "AI",
    description: "Practical AI vocabulary: prompts, model behavior, evaluation, embeddings, and safety.",
    entries: [
      ["PROMPT", "The input text or instruction given to an AI model."],
      ["TOKEN", "A small unit of text processed by a language model."],
      ["EMBEDDING", "A numeric representation of meaning."],
      ["MODEL", "A trained system that produces predictions or responses."],
      ["TRAINING", "The process of teaching a model from data."],
      ["INFERENCE", "Using a trained model to produce an output."],
      ["AGENT", "A system that can plan and use tools to complete tasks."],
      ["CONTEXT", "Information given to a model to guide its response."],
      ["VECTOR", "A list of numbers used to represent data."],
      ["EVALUATION", "Measuring how well a model performs."],
      ["HALLUCINATION", "A wrong or unsupported answer produced by a model."],
      ["GUARDRAIL", "A rule or check that limits unsafe model behavior."]
    ]
  }
];

let activeThemeIndex = 0;
let revealed = false;
let activePuzzle = null;
const answerPassword = "avito";

const tabsEl = document.querySelector("#theme-tabs");
const gridEl = document.querySelector("#crossword-grid");
const titleEl = document.querySelector("#theme-title");
const descriptionEl = document.querySelector("#theme-description");
const acrossCluesEl = document.querySelector("#across-clues");
const downCluesEl = document.querySelector("#down-clues");
const revealButton = document.querySelector("#reveal-button");
const printButton = document.querySelector("#print-button");
const wordCountEl = document.querySelector("#word-count");
const gridSizeEl = document.querySelector("#grid-size");
const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password-input");
const passwordStatus = document.querySelector("#password-status");
const answerBankEl = document.querySelector("#answer-bank");

function key(row, col) {
  return `${row},${col}`;
}

function readCell(grid, row, col) {
  return grid.get(key(row, col));
}

function writeCell(grid, row, col, char) {
  grid.set(key(row, col), char);
}

function canPlace(grid, word, row, col, dir) {
  const delta = dir === "across" ? [0, 1] : [1, 0];
  const sideDelta = dir === "across" ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
  const before = readCell(grid, row - delta[0], col - delta[1]);
  const after = readCell(grid, row + delta[0] * word.length, col + delta[1] * word.length);

  if (before || after) return false;

  let crosses = 0;
  for (let index = 0; index < word.length; index += 1) {
    const r = row + delta[0] * index;
    const c = col + delta[1] * index;
    const existing = readCell(grid, r, c);

    if (existing && existing !== word[index]) return false;
    if (existing === word[index]) {
      crosses += 1;
      continue;
    }

    for (const [sr, sc] of sideDelta) {
      if (readCell(grid, r + sr, c + sc)) return false;
    }
  }

  return { crosses };
}

function placeWord(grid, placed, entry, row, col, dir) {
  const [word, clue] = entry;
  const delta = dir === "across" ? [0, 1] : [1, 0];

  for (let index = 0; index < word.length; index += 1) {
    writeCell(grid, row + delta[0] * index, col + delta[1] * index, word[index]);
  }

  placed.push({ word, clue, row, col, dir, number: 0 });
}

function buildPuzzle(entries) {
  const grid = new Map();
  const placed = [];
  const sorted = [...entries].sort((a, b) => b[0].length - a[0].length);
  placeWord(grid, placed, sorted[0], 0, 0, "across");

  for (const entry of sorted.slice(1)) {
    const [word] = entry;
    const candidates = [];

    for (const placedWord of placed) {
      const targetDir = placedWord.dir === "across" ? "down" : "across";
      for (let i = 0; i < word.length; i += 1) {
        for (let j = 0; j < placedWord.word.length; j += 1) {
          if (word[i] !== placedWord.word[j]) continue;
          const crossRow = placedWord.row + (placedWord.dir === "down" ? j : 0);
          const crossCol = placedWord.col + (placedWord.dir === "across" ? j : 0);
          const row = targetDir === "across" ? crossRow : crossRow - i;
          const col = targetDir === "across" ? crossCol - i : crossCol;
          const fit = canPlace(grid, word, row, col, targetDir);
          if (fit) {
            candidates.push({ row, col, dir: targetDir, score: fit.crosses * 100 - Math.abs(row) - Math.abs(col) });
          }
        }
      }
    }

    if (candidates.length) {
      candidates.sort((a, b) => b.score - a.score);
      placeWord(grid, placed, entry, candidates[0].row, candidates[0].col, candidates[0].dir);
    } else {
      const bounds = getBounds(grid);
      const fallbackRow = bounds.maxRow + 3;
      const fallbackCol = bounds.minCol;
      placeWord(grid, placed, entry, fallbackRow, fallbackCol, "across");
    }
  }

  const bounds = getBounds(grid);
  const offsetRow = -bounds.minRow;
  const offsetCol = -bounds.minCol;
  const shiftedGrid = new Map();

  for (const [cellKey, value] of grid.entries()) {
    const [row, col] = cellKey.split(",").map(Number);
    shiftedGrid.set(key(row + offsetRow, col + offsetCol), value);
  }

  for (const item of placed) {
    item.row += offsetRow;
    item.col += offsetCol;
  }

  assignNumbers(placed);
  const finalBounds = getBounds(shiftedGrid);
  return { grid: shiftedGrid, placed, bounds: finalBounds };
}

function getBounds(grid) {
  const rows = [];
  const cols = [];
  for (const cellKey of grid.keys()) {
    const [row, col] = cellKey.split(",").map(Number);
    rows.push(row);
    cols.push(col);
  }
  return {
    minRow: Math.min(...rows),
    maxRow: Math.max(...rows),
    minCol: Math.min(...cols),
    maxCol: Math.max(...cols)
  };
}

function assignNumbers(placed) {
  const starts = new Map();
  for (const item of placed) {
    starts.set(key(item.row, item.col), null);
  }

  [...starts.keys()]
    .map((cellKey) => cellKey.split(",").map(Number))
    .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]))
    .forEach(([row, col], index) => {
      starts.set(key(row, col), index + 1);
    });

  for (const item of placed) {
    item.number = starts.get(key(item.row, item.col));
  }
}

function renderTabs() {
  tabsEl.innerHTML = "";
  themes.forEach((theme, index) => {
    const button = document.createElement("button");
    button.className = "theme-tab";
    button.type = "button";
    button.textContent = theme.tab;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(index === activeThemeIndex));
    button.addEventListener("click", () => {
      activeThemeIndex = index;
      revealed = false;
      passwordStatus.textContent = "";
      passwordInput.value = "";
      render();
    });
    tabsEl.appendChild(button);
  });
}

function render() {
  const theme = themes[activeThemeIndex];
  activePuzzle = buildPuzzle(theme.entries);

  document.body.classList.toggle("revealed", revealed);
  revealButton.textContent = revealed ? "Hide words" : "Unlock words";
  titleEl.textContent = theme.title;
  descriptionEl.textContent = theme.description;
  wordCountEl.textContent = `${theme.entries.length} words`;

  renderTabs();
  renderGrid(activePuzzle);
  renderClues(activePuzzle.placed);
  renderAnswerBank(activePuzzle.placed);
}

function renderGrid(puzzle) {
  const rows = puzzle.bounds.maxRow - puzzle.bounds.minRow + 1;
  const cols = puzzle.bounds.maxCol - puzzle.bounds.minCol + 1;
  const numberByCell = new Map(puzzle.placed.map((item) => [key(item.row, item.col), item.number]));

  gridSizeEl.textContent = `${cols} x ${rows} grid`;
  gridEl.innerHTML = "";
  gridEl.style.minWidth = `${cols * 24}px`;
  gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(24px, 1fr))`;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const char = readCell(puzzle.grid, row, col);
      const cell = document.createElement("div");
      cell.className = char ? "cell" : "cell empty";
      if (row === 0) cell.classList.add("top-edge");
      if (col === 0) cell.classList.add("left-edge");

      if (char) {
        const number = numberByCell.get(key(row, col));
        if (number) {
          const numberEl = document.createElement("span");
          numberEl.className = "number";
          numberEl.textContent = number;
          cell.appendChild(numberEl);
        }

        const letter = document.createElement("span");
        letter.className = "letter";
        letter.textContent = char;
        cell.appendChild(letter);
      }

      gridEl.appendChild(cell);
    }
  }
}

function renderClues(placed) {
  const across = placed.filter((item) => item.dir === "across").sort(sortClues);
  const down = placed.filter((item) => item.dir === "down").sort(sortClues);
  renderClueList(acrossCluesEl, across);
  renderClueList(downCluesEl, down);
}

function sortClues(a, b) {
  return a.number - b.number || a.word.localeCompare(b.word);
}

function renderClueList(target, items) {
  target.innerHTML = "";

  for (const item of items) {
    const li = document.createElement("li");
    const number = document.createElement("span");
    number.className = "clue-number";
    number.textContent = `${item.number}.`;

    const text = document.createElement("span");
    text.className = "clue-text";

    const clue = document.createElement("span");
    clue.textContent = item.clue;

    const hint = document.createElement("span");
    hint.className = "clue-hint";

    const pattern = document.createElement("span");
    pattern.className = "word-pattern";
    pattern.textContent = formatPattern(item.word);

    const length = document.createElement("span");
    length.className = "word-length";
    length.textContent = `${item.word.length} letters`;

    const answer = document.createElement("span");
    answer.className = "answer";
    answer.textContent = item.word;
    hint.append(pattern, length);
    text.append(clue, hint, answer);

    li.append(number, text);
    target.appendChild(li);
  }
}

function renderAnswerBank(placed) {
  answerBankEl.innerHTML = "";
  const sortedWords = [...placed].sort(sortClues);

  for (const item of sortedWords) {
    const chip = document.createElement("span");
    chip.className = "answer-chip";
    chip.textContent = `${item.number}. ${item.word}`;
    answerBankEl.appendChild(chip);
  }
}

function formatPattern(word) {
  if (word.length <= 2) return word;
  return `${word[0]}${"-".repeat(word.length - 2)}${word[word.length - 1]}`;
}

revealButton.addEventListener("click", () => {
  if (revealed) {
    revealed = false;
    passwordStatus.textContent = "Words hidden.";
    render();
    return;
  }

  passwordInput.focus();
  passwordStatus.textContent = "Enter password to reveal the word bank.";
});

printButton.addEventListener("click", () => {
  window.print();
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = passwordInput.value.trim().toLowerCase();

  if (value === answerPassword) {
    revealed = true;
    passwordStatus.textContent = "Unlocked.";
    render();
    return;
  }

  revealed = false;
  passwordStatus.textContent = "Wrong password. Try again.";
  document.body.classList.remove("revealed");
});

render();
