/* ============================================================
   VoltGo — Interactive Smart Energy Network Background
   Lightweight 60fps canvas animating IoT grid nodes,
   electrical connections, and energy pulses.
   ============================================================ */

(function () {
  function initEnergyCanvas() {
    let canvas = document.getElementById("energyCanvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "energyCanvas";
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "-1";
      canvas.style.opacity = "0.85";
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const mouse = { x: null, y: null, maxDist: 160 };
    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("mouseleave", function () {
      mouse.x = null;
      mouse.y = null;
    });

    // VoltGo palette: Electric Cyan, Green, Bright Blue
    const colors = [
      "rgba(10, 152, 181, ",  // Cyan
      "rgba(25, 195, 223, ", // Bright Cyan
      "rgba(28, 154, 85, ",  // Green
      "rgba(62, 209, 127, ", // Bright Green
      "rgba(12, 35, 64, "    // Deep Navy
    ];

    const particleCount = Math.min(Math.max(Math.floor((width * height) / 16000), 28), 65);
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.65;
        this.vy = (Math.random() - 0.5) * 0.65;
        this.radius = Math.random() * 2 + 1.8;
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.03 + Math.random() * 0.02;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;

        this.pulse += this.pulseSpeed;
      }

      draw() {
        const alpha = 0.45 + Math.sin(this.pulse) * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + alpha + ")";
        ctx.fill();

        // Glowing outer aura
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + (alpha * 0.2) + ")";
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Electrical pulses traversing connections
    const pulses = [];
    function emitPulse() {
      if (particles.length < 2) return;
      const p1 = particles[Math.floor(Math.random() * particles.length)];
      let closest = null;
      let minDist = 140;

      for (let p2 of particles) {
        if (p1 === p2) continue;
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < minDist) {
          minDist = d;
          closest = p2;
        }
      }

      if (closest) {
        pulses.push({
          x1: p1.x, y1: p1.y,
          x2: closest.x, y2: closest.y,
          progress: 0,
          speed: 0.028 + Math.random() * 0.02
        });
      }
    }

    setInterval(emitPulse, 900);

    let isVisible = true;
    document.addEventListener("visibilitychange", function () {
      isVisible = !document.hidden;
    });

    function render() {
      if (!isVisible) {
        requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const maxDist = 140;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Draw node connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = "rgba(10, 152, 181, " + alpha + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw interactive connection to cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.maxDist) {
            const alpha = (1 - dist / mouse.maxDist) * 0.55;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "rgba(25, 195, 223, " + alpha + ")";
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
        }
      }

      // Render traveling electrical pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const px = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.progress;
        const py = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#19c3df";
        ctx.shadowColor = "#19c3df";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Update & draw particle nodes
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      requestAnimationFrame(render);
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEnergyCanvas);
  } else {
    initEnergyCanvas();
  }
})();
