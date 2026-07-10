/**
 * MODULE 6: Reporting Module
 * Computes statistics and renders the city bar chart.
 */
const Reports = (() => {

  function getTotalCount() {
    return DB.getAll().length;
  }

  function getByCity() {
    const map = {};
    DB.getAll().forEach(c => {
      const city = c.city || 'Unknown';
      map[city] = (map[city] || 0) + 1;
    });
    return map;
  }

  function getRecentlyAdded(n = 5) {
    return [...DB.getAll()]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, n);
  }

  /** Draw city distribution bar chart on a <canvas> */
  function drawCityChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cityMap = getByCity();
    const labels = Object.keys(cityMap);
    const values = Object.values(cityMap);
    const max = Math.max(...values, 1);

    const W = canvas.width;
    const H = canvas.height;
    const padL = 50, padB = 55, padT = 20, padR = 20;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const barW = Math.min(50, chartW / labels.length - 12);

    ctx.clearRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    // Grid lines
    const steps = 5;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= steps; i++) {
      const v = Math.round((max / steps) * i);
      const y = padT + chartH - (v / max) * chartH;
      ctx.fillText(v, padL - 8, y + 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
    }

    // Bars
    const colors = ['#6c63ff', '#ff6584', '#43e97b', '#fa709a', '#4facfe', '#f093fb', '#a18cd1', '#fda085'];
    labels.forEach((city, i) => {
      const x = padL + (i / labels.length) * chartW + (chartW / labels.length - barW) / 2;
      const barH = (values[i] / max) * chartH;
      const y = padT + chartH - barH;

      // Gradient fill
      const grad = ctx.createLinearGradient(x, y, x, padT + chartH);
      grad.addColorStop(0, colors[i % colors.length]);
      grad.addColorStop(1, colors[i % colors.length] + '44');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Value label
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(values[i], x + barW / 2, y - 6);

      // City label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px Inter, sans-serif';
      ctx.save();
      ctx.translate(x + barW / 2, padT + chartH + 8);
      ctx.rotate(-0.4);
      ctx.fillText(city, 0, 0);
      ctx.restore();
    });
  }

  return { getTotalCount, getByCity, getRecentlyAdded, drawCityChart };
})();
