const DEFAULT_COLS = 8;

// =========================
// TEXT ↔ BYTES
// =========================
function textToBytes(text) {
  return new TextEncoder().encode(text);
}

function bytesToText(bytes) {
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// =========================
// KEY STREAM
// =========================
function generateKeyStream(password, length) {
  let key = [...password].map(c => c.charCodeAt(0));
  let stream = [];

  for (let i = 0; i < length; i++) {
    stream.push(key[i % key.length]);
  }

  return stream;
}

// =========================
// MATRIX
// =========================
function makeMatrix(data, cols) {
  let rows = Math.ceil(data.length / cols);
  let matrix = [];
  let index = 0;

  for (let r = 0; r < rows; r++) {
    let row = [];

    for (let c = 0; c < cols; c++) {
      if (index < data.length) {
        row.push(data[index++]);
      } else {
        row.push(0);
      }
    }

    matrix.push(row);
  }

  return matrix;
}

function flattenMatrix(matrix) {
  return matrix.flat();
}

// =========================
// BASE64 HELPERS
// =========================
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(str) {
  return [...atob(str)].map(c => c.charCodeAt(0));
}

// =========================
// ENCRYPT
// =========================
function encrypt(text, password) {
  let data = [...textToBytes(text)];

  let matrix = makeMatrix(data, DEFAULT_COLS);
  let flat = flattenMatrix(matrix);

  let keyStream = generateKeyStream(password, flat.length);

  let encrypted = flat.map((b, i) => b ^ keyStream[i]);

  return toBase64(encrypted);
}

// =========================
// DECRYPT
// =========================
function decrypt(text, password) {
  let data = fromBase64(text);

  let keyStream = generateKeyStream(password, data.length);

  let decrypted = data.map((b, i) => b ^ keyStream[i]);

  let matrix = makeMatrix(decrypted, DEFAULT_COLS);
  let flat = flattenMatrix(matrix);

  return bytesToText(flat);
}

// =========================
// UI LOGIC
// =========================
let uploadedText = "";

document.getElementById("fileInput").addEventListener("change", function (e) {
  let file = e.target.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function (event) {
    uploadedText = event.target.result;
  };
  reader.readAsText(file);
});

function process() {
  let mode = document.getElementById("mode").value;
  let password = document.getElementById("password").value;

  let text = uploadedText || document.getElementById("inputText").value;

  let result = "";

  if (mode === "encrypt") {
    result = encrypt(text, password);
  } else {
    result = decrypt(text, password);
  }

  document.getElementById("outputText").value = result;
}

function downloadOutput() {
  let text = document.getElementById("outputText").value;

  let blob = new Blob([text], { type: "text/plain" });
  let link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "cipher_output.txt";
  link.click();
}
