// ============================================================
// VOCABULARY TRAINER — share.js
// Draws a shareable PNG "result card" on a canvas, entirely client-side.
// ============================================================

function drawShareCard({ headline, statLine, subLine, footer }){
  const canvas = document.createElement('canvas');
  const W = 1080, H = 1080;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // background gradient (matches site brand colors)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#4655f5');
  grad.addColorStop(0.55, '#8b5cf6');
  grad.addColorStop(1, '#333fd1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // soft glow circles
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(140, 120, 220, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(960, 940, 260, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  // card
  const pad = 70;
  const cardX = pad, cardY = 220, cardW = W - pad*2, cardH = 640;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fill();

  // brand line
  ctx.fillStyle = '#8b5cf6';
  ctx.font = '700 34px Poppins, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VOCABULARY TRAINER', W/2, 130);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '500 26px Inter, Arial, sans-serif';
  ctx.fillText(headline, W/2, 180);

  // big stat
  ctx.fillStyle = '#1c2440';
  ctx.font = '800 130px Poppins, Arial, sans-serif';
  ctx.fillText(statLine, W/2, cardY + 300);

  ctx.fillStyle = '#667089';
  ctx.font = '600 34px Inter, Arial, sans-serif';
  ctx.fillText(subLine, W/2, cardY + 380);

  // divider
  ctx.strokeStyle = '#e1e7f7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 80, cardY + cardH - 140);
  ctx.lineTo(cardX + cardW - 80, cardY + cardH - 140);
  ctx.stroke();

  ctx.fillStyle = '#667089';
  ctx.font = '500 26px Inter, Arial, sans-serif';
  ctx.fillText(footer, W/2, cardY + cardH - 80);

  ctx.fillStyle = '#4655f5';
  ctx.font = '700 28px Inter, Arial, sans-serif';
  ctx.fillText('Study yours → vocab trainer', W/2, cardY + cardH - 35);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

async function shareOrDownloadCanvas(canvas, filename, shareText){
  canvas.toBlob(async (blob) => {
    if(!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      try{
        await navigator.share({ files: [file], text: shareText, title: 'Vocabulary Trainer' });
        return;
      }catch(e){ /* user cancelled or unsupported — fall through to download */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function shareResultCard({ headline, statLine, subLine, footer, filename, shareText }){
  const canvas = drawShareCard({ headline, statLine, subLine, footer });
  shareOrDownloadCanvas(canvas, filename || 'vocab-result.png', shareText || headline);
}
