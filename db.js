const DB_NAME = "file-monitor-db";
const STORE = "handles";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveHandle(handle) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(handle, "file");
  return tx.complete;
}

export async function loadHandle() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  return tx.objectStore(STORE).get("file");
}
