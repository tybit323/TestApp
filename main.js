import { saveHandle, loadHandle } from "./db.js";

const selectBtn = document.getElementById("select-file-btn");
const changeBtn = document.getElementById("change-file-btn");
const output = document.getElementById("output");

let fileHandle = null;
let lastOffset = 0;
let pollingTimer = null;

const decoder = new TextDecoder();

async function hasPermission(handle) {
  const opts = { mode: "read" };
  return (
    (await handle.queryPermission(opts)) === "granted" ||
    (await handle.requestPermission(opts)) === "granted"
  );
}

async function selectFile() {
  [fileHandle] = await window.showOpenFilePicker();
  await saveHandle(fileHandle);
  startMonitoring(true);
}

async function startMonitoring(reset = false) {
  if (!(await hasPermission(fileHandle))) return;

  selectBtn.classList.add("hidden");
  output.classList.remove("hidden");

  if (pollingTimer) clearInterval(pollingTimer);

  const file = await fileHandle.getFile();

  if (reset) {
    // Start at end of file so we only stream *new* lines
    lastOffset = file.size;
    output.value = "";
  }

  pollingTimer = setInterval(async () => {
    try {
      const file = await fileHandle.getFile();

      if (file.size <= lastOffset) return;

      const chunk = file.slice(lastOffset, file.size);
      const buffer = await chunk.arrayBuffer();
      const text = decoder.decode(buffer, { stream: true });

      output.value += text;
      output.scrollTop = output.scrollHeight;

      lastOffset = file.size;
    } catch (err) {
      console.error("File read error:", err);
    }
  }, 1000);
}

async function init() {
  fileHandle = await loadHandle();

  if (fileHandle && await hasPermission(fileHandle)) {
    // Resume monitoring without re-reading the whole file
    startMonitoring(false);
  } else {
    selectBtn.classList.remove("hidden");
  }
}

selectBtn.onclick = selectFile;
changeBtn.onclick = selectFile;

init();
