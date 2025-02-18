
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const header = document.getElementById('header');
  let originalText = header.textContent;
  let stopExplosions = false;   // NEW: Flag to disable explosions.
  let exploded = false;
  const simulationDuration = 8000; // Simulation runs for 8 seconds.
  let simulationStartTime, lastFrameTime;
  const lettersData = [];
  
  // Track the mouse position globally.
  let currentMouseX = -1000, currentMouseY = -1000;
  document.addEventListener('mousemove', e => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
  });
  
  // Split the header text into individual spans.
  function splitText() {
    if (!header.dataset.split) {
      const text = header.textContent;
      header.textContent = '';
      for (const char of text) {
        if (char === ' ') {
          header.appendChild(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.style.color = randomColor(); // Assign a random RGB color.
          span.textContent = char;
          header.appendChild(span);
      }
    }
      header.dataset.split = 'true';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    splitText();
    originalText = header.innerHTML;
  });
  
  header.addEventListener('mouseenter', (e) => {
    if (stopExplosions) return;  // NEW: Stop if the flag is true.
    if (exploded) return;
    exploded = true;
    splitText();
    
    // Capture the mouse position on hover start.
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const spans = header.querySelectorAll('span');
    spans.forEach(span => {
      const rect = span.getBoundingClientRect();
      const originalX = rect.left;
      const originalY = rect.top;
      
      // Calculate the letter's center.
      const centerX = originalX + rect.width / 2;
      const centerY = originalY + rect.height / 2;
      
      // Determine vector from mouse to letter center.
      let dx = centerX - mouseX;
      let dy = centerY - mouseY;
      let mag = Math.sqrt(dx * dx + dy * dy);
      if (mag < 0.1) { // Prevent division by zero.
        dx = 1;
        dy = 0;
        mag = 1;
      }
      // Normalize and apply a 50px offset.
      const offset = 50;
      const offsetX = (dx / mag) * offset;
      const offsetY = (dy / mag) * offset;
      
      // Starting positions are offset by 50px away from the mouse.
      const startX = originalX + offsetX;
      const startY = originalY + offsetY;
      
      // Set fixed positioning so letters can move freely.
      span.style.position = 'fixed';
      span.style.left = startX + 'px';
      span.style.top = startY + 'px';
      
      // Assign a random initial velocity.
      const vx = randomRange(-150, 150);
      const vy = randomRange(-150, 150);
      
      lettersData.push({
        element: span,
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        originalX: originalX,
        originalY: originalY
      });
    });
    
    simulationStartTime = performance.now();
    lastFrameTime = simulationStartTime;
    requestAnimationFrame(simulationLoop);
  });
  
  function simulationLoop(now) {
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    
    lettersData.forEach(letter => {
      // Update position.
      letter.x += letter.vx * dt;
      letter.y += letter.vy * dt;
      
      const rect = letter.element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Bounce off viewport boundaries.
      if (letter.x < 0) {
        letter.x = 0;
        letter.vx = -letter.vx;
      }
      if (letter.x + width > window.innerWidth) {
        letter.x = window.innerWidth - width;
        letter.vx = -letter.vx;
      }
      if (letter.y < 0) {
        letter.y = 0;
        letter.vy = -letter.vy;
      }
      if (letter.y + height > window.innerHeight) {
        letter.y = window.innerHeight - height;
        letter.vy = -letter.vy;
      }
      
      // Proximity repulsion: if the letter's center is within 50px of the mouse, repulse it.
      const letterCenterX = letter.x + width / 2;
      const letterCenterY = letter.y + height / 2;
      const dx = letterCenterX - currentMouseX;
      const dy = letterCenterY - currentMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 50) {
        let currentSpeed = Math.sqrt(letter.vx * letter.vx + letter.vy * letter.vy);
        if (currentSpeed < 0.01) currentSpeed = 1;
        const newSpeed = 2 * currentSpeed;
        // Recalculate velocity directly away from the mouse.
        letter.vx = (dx / dist) * newSpeed;
        letter.vy = (dy / dist) * newSpeed;
      }
      
      letter.element.style.left = letter.x + 'px';
      letter.element.style.top = letter.y + 'px';
    });
    
    if (now - simulationStartTime < simulationDuration) {
requestAnimationFrame(simulationLoop);
  } else {
let transitionsCompleted = 0;
const totalLetters = lettersData.length;
lettersData.forEach(letter => {
  letter.element.style.transition = 'left 2s ease, top 2s ease';
  letter.element.style.left = letter.originalX + 'px';
  letter.element.style.top = letter.originalY + 'px';
  letter.element.addEventListener('transitionend', function handler() {
    transitionsCompleted++;
    if (transitionsCompleted === totalLetters) {
      // Once all letters have transitioned back, reassemble the header
      // with the original text (which restores normal spacing between words).
      header.innerHTML = originalText;
      exploded = false;
      lettersData.length = 0;
      delete header.dataset.split;
    }
  }, { once: true });
});
}
  }
document.getElementById('stopForm').addEventListener('submit', function(e) {
       e.preventDefault();
       const selected = document.querySelector('input[name="action"]:checked');
       if (selected) {
         if (selected.value === "stop") {
           stopExplosions = true;
         } else if (selected.value === "undo") {
           stopExplosions = false;
         }
       }
     });
