import { Product } from '../types';

/**
 * Helper to draw rounded rectangle safely across all canvas implementations
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

/**
 * Generates and downloads a high-resolution, branded Catalog Card image for WhatsApp/Instagram.
 */
export async function exportCatalogCardAsImage(product: Product, artisanName: string = 'Vedansh'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const width = 1080;
      const height = 1350;
      const pad = 40;
      const cardW = width - pad * 2;
      const cardH = height - pad * 2;
      const radius = 32;

      // Helper to download a canvas blob
      const downloadBlob = (canvas: HTMLCanvasElement): Promise<void> => {
        return new Promise((res, rej) => {
          try {
            canvas.toBlob((blob) => {
              if (blob) {
                const link = document.createElement('a');
                link.download = `${product.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-catalog-card.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                res();
              } else {
                rej(new Error('Canvas export produced empty blob'));
              }
            }, 'image/png');
          } catch (blobErr) {
            rej(blobErr);
          }
        });
      };

      // Draw standard card layout
      const drawCardBase = (ctx: CanvasRenderingContext2D) => {
        // Background - Warm eggshell / modern tactile paper
        ctx.fillStyle = '#FAF9F6';
        ctx.fillRect(0, 0, width, height);

        // Card Container
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, pad, pad, cardW, cardH, radius);
        ctx.fill();
        ctx.restore();

        // Top Branding Header inside card
        ctx.fillStyle = '#8E4E14';
        ctx.font = 'bold 36px Montserrat, sans-serif';
        ctx.fillText('Kalaकार AI', pad + 40, pad + 70);

        ctx.fillStyle = '#2A9D8F';
        ctx.font = '600 22px Inter, sans-serif';
        ctx.fillText('✦ Verified Artisan Heritage', width - pad - 320, pad + 70);
      };

      const drawDetailsAndPrice = (ctx: CanvasRenderingContext2D, contentY: number) => {
        // Title
        ctx.fillStyle = '#1A1C1A';
        ctx.font = 'bold 44px Montserrat, sans-serif';
        ctx.fillText(product.title, pad + 40, contentY);

        // Artisan sub-byline
        ctx.fillStyle = '#765A05';
        ctx.font = '500 24px Inter, sans-serif';
        ctx.fillText(`Handcrafted by ${artisanName} • ${product.category}`, pad + 40, contentY + 40);

        // Description (multiline wrap)
        ctx.fillStyle = '#534439';
        ctx.font = '400 26px Inter, sans-serif';
        const maxTextW = cardW - 80;
        const words = (product.description || '').split(' ');
        let line = '';
        let textY = contentY + 90;
        const lineHeight = 38;
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextW && n > 0) {
            ctx.fillText(line, pad + 40, textY);
            line = words[n] + ' ';
            textY += lineHeight;
            lineCount++;
            if (lineCount >= 3) {
              line += '...';
              break;
            }
          } else {
            line = testLine;
          }
        }
        if (lineCount < 3) {
          ctx.fillText(line, pad + 40, textY);
        }

        // Price Tag Pill Banner
        const priceY = height - pad - 120;
        ctx.fillStyle = '#FDF6EE';
        ctx.strokeStyle = '#E7C268';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, pad + 40, priceY, cardW - 80, 80, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#6F3800';
        ctx.font = '600 22px Inter, sans-serif';
        ctx.fillText('Suggested Fair Price:', pad + 70, priceY + 48);

        ctx.fillStyle = '#8E4E14';
        ctx.font = 'bold 36px Montserrat, sans-serif';
        const priceStr = `₹${product.minPrice.toLocaleString('en-IN')}${
          product.maxPrice > product.minPrice ? ` - ₹${product.maxPrice.toLocaleString('en-IN')}` : ''
        }`;
        ctx.fillText(priceStr, pad + 340, priceY + 52);

        // Artisan Direct Tag
        ctx.fillStyle = '#2A9D8F';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText('Direct Artisan Listing 🛍️', width - pad - 340, priceY + 48);
      };

      // Fallback renderer when cross-origin image cannot be extracted
      const renderFallbackCard = async () => {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = width;
        fallbackCanvas.height = height;
        const fbCtx = fallbackCanvas.getContext('2d');
        if (!fbCtx) throw new Error('Canvas 2D context not available');

        drawCardBase(fbCtx);

        // Draw elegant craft placeholder banner
        const imgX = pad + 40;
        const imgY = pad + 110;
        const imgW = cardW - 80;
        const imgH = 620;

        fbCtx.fillStyle = '#F4EAE1';
        drawRoundedRect(fbCtx, imgX, imgY, imgW, imgH, 24);
        fbCtx.fill();

        fbCtx.fillStyle = '#8E4E14';
        fbCtx.font = 'bold 48px Montserrat, sans-serif';
        fbCtx.textAlign = 'center';
        fbCtx.fillText(product.title, width / 2, imgY + 280);

        fbCtx.fillStyle = '#765A05';
        fbCtx.font = '600 26px Inter, sans-serif';
        fbCtx.fillText(`[ ${product.category} • Handcrafted Heritage ]`, width / 2, imgY + 340);
        fbCtx.textAlign = 'left';

        drawDetailsAndPrice(fbCtx, imgY + imgH + 50);
        await downloadBlob(fallbackCanvas);
      };

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not supported');
      }

      drawCardBase(ctx);

      const imgX = pad + 40;
      const imgY = pad + 110;
      const imgW = cardW - 80;
      const imgH = 620;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          ctx.save();
          drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 24);
          ctx.clip();
          ctx.drawImage(img, imgX, imgY, imgW, imgH);
          ctx.restore();

          // Badge on top of image
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          drawRoundedRect(ctx, imgX + 24, imgY + 24, 180, 44, 22);
          ctx.fill();
          ctx.fillStyle = '#8E4E14';
          ctx.font = 'bold 18px Inter, sans-serif';
          ctx.fillText('✨ AI Enhanced', imgX + 44, imgY + 52);

          drawDetailsAndPrice(ctx, imgY + imgH + 50);

          try {
            await downloadBlob(canvas);
            resolve();
          } catch (securityErr) {
            console.warn('Canvas tainted by cross-origin image; falling back to clean text card:', securityErr);
            await renderFallbackCard();
            resolve();
          }
        } catch (renderErr) {
          console.warn('Canvas render error, trying fallback:', renderErr);
          try {
            await renderFallbackCard();
            resolve();
          } catch (fbErr) {
            reject(fbErr);
          }
        }
      };

      img.onerror = async () => {
        try {
          await renderFallbackCard();
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      img.src = product.imageUrl;
    } catch (err) {
      reject(err);
    }
  });
}
