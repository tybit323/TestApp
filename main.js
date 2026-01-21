import { saveHandle, loadHandle } from "./db.js";

const selectBtn = document.getElementById("select-file-btn");
const changeBtn = document.getElementById("change-file-btn");
const output = document.getElementById("output");

let fileHandle = null;
let lastSize = 0;

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
  startMonitoring();
}

async function startMonitoring() {
  if (!(await hasPermission(fileHandle))) return;

  selectBtn.classList.add("hidden");
  output.classList.remove("hidden");

  lastSize = 0;
  output.value = "";

  setInterval(async () => {
    const file = await fileHandle.getFile();
    if (file.size > lastSize) {
      const text = await file.text();
      output.value = text;
      output.scrollTop = output.scrollHeight;
      lastSize = file.size;
    }
  }, 1000);
}

async function init() {
  fileHandle = await loadHandle();
  if (fileHandle && await hasPermission(fileHandle)) {
    startMonitoring();
  } else {
    selectBtn.classList.remove("hidden");
  }
}

selectBtn.onclick = selectFile;
changeBtn.onclick = selectFile;

init();
