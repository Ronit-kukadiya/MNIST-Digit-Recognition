window.onload = function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const predictBtn = document.getElementById("predict-btn");
  const resultText = document.getElementById("predicted-digit");
  const confidenceList = document.getElementById("confidence-list");
  const themeToggle = document.getElementById("theme-toggle");

  let painting = false;

  // Set initial background to black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set drawing color to white
  ctx.strokeStyle = "white";
  ctx.lineWidth = 15;
  ctx.lineCap = "round";

  // Start drawing (mouse)
  function startPosition(e) {
    painting = true;
    draw(e);
  }

  function endPosition() {
    painting = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!painting) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  // Touch support (for mobile)
  function startTouch(e) {
    e.preventDefault();
    painting = true;
    drawTouch(e);
  }

  function endTouch() {
    painting = false;
    ctx.beginPath();
  }

  function drawTouch(e) {
    if (!painting) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  // Event Listeners for Mouse
  canvas.addEventListener("mousedown", startPosition);
  canvas.addEventListener("mouseup", endPosition);
  canvas.addEventListener("mousemove", draw);

  // Event Listeners for Touch
  canvas.addEventListener("touchstart", startTouch);
  canvas.addEventListener("touchend", endTouch);
  canvas.addEventListener("touchmove", drawTouch);

  // Clear canvas function
  function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    resultText.innerText = "-";
    confidenceList.innerHTML = "";
  }

  window.clearCanvas = clearCanvas;

  // Predict function
  predictBtn.addEventListener("click", function () {
    const imageData = canvas.toDataURL("image/png");

    fetch("/predict", {
      method: "POST",
      body: JSON.stringify({ image: imageData }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        resultText.innerText = `${data.predictions[0].digit}`;
        confidenceList.innerHTML = data.predictions
          .slice(0, 3)
          .map((p) => `<li>${p.digit}: ${p.confidence}% confidence</li>`)
          .join("");
      })
      .catch((error) => console.error("Error:", error));
  });

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("light-mode");
  });
};
