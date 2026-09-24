/**
 * Pure Canvas Utility with Dynamic Names, Filters, Themes & Unrestricted Full-Strip Sticker Layer
 * Renders 4 sequential video frame pairs into an aesthetic photobooth strip.
 */

export const FILTER_CANVAS_MAP = {
  normal: 'none',
  grayscale: 'grayscale(100%) contrast(1.1)',
  vintage: 'sepia(65%) contrast(1.08) brightness(0.95) saturate(1.15)',
  noir: 'grayscale(100%) sepia(20%) contrast(1.25)'
};

export const FILTER_CSS_MAP = {
  normal: 'none',
  grayscale: 'grayscale(100%) contrast(110%)',
  vintage: 'sepia(65%) contrast(108%) brightness(95%) saturate(115%)',
  noir: 'grayscale(100%) sepia(20%) contrast(125%)'
};

export const FRAME_THEMES = {
  cream: {
    id: 'cream',
    label: 'Vintage Cream',
    bgColor: '#FCFAF5',
    textColor: '#1c1917',
    accentColor: '#f43f5e',
    dotColor: 'rgba(0, 0, 0, 0.035)',
    subtitleColor: '#78716c',
    footerDateColor: '#44403c',
    footerTagColor: '#a8a29e',
    photoBorder: 'rgba(0, 0, 0, 0.12)'
  },
  charcoal: {
    id: 'charcoal',
    label: 'Midnight Charcoal',
    bgColor: '#18181b',
    textColor: '#f4f4f5',
    accentColor: '#fb7185',
    dotColor: 'rgba(255, 255, 255, 0.04)',
    subtitleColor: '#a1a1aa',
    footerDateColor: '#e4e4e7',
    footerTagColor: '#71717a',
    photoBorder: 'rgba(255, 255, 255, 0.16)'
  },
  blush: {
    id: 'blush',
    label: 'Blush Pink',
    bgColor: '#FDF2F4',
    textColor: '#3f1d24',
    accentColor: '#e11d48',
    dotColor: 'rgba(225, 29, 72, 0.04)',
    subtitleColor: '#9f5767',
    footerDateColor: '#592731',
    footerTagColor: '#a36c77',
    photoBorder: 'rgba(225, 29, 72, 0.15)'
  }
};

export function captureVideoFrame(videoElement, isMirrored = false) {
  if (!videoElement || videoElement.readyState < 2) {
    return null;
  }
  const canvas = document.createElement('canvas');
  const vw = videoElement.videoWidth || 640;
  const vh = videoElement.videoHeight || 480;
  canvas.width = vw;
  canvas.height = vh;
  const ctx = canvas.getContext('2d');

  if (isMirrored) {
    ctx.translate(vw, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(videoElement, 0, 0, vw, vh);
  return canvas;
}

/**
 * Render 4 captured frame pairs + unrestricted full-strip stickers
 */
export function renderPhotoboothStrip(shotsArray, options = {}) {
  const {
    localName = 'Ritchi',
    partnerName = 'Kristine',
    names = null,
    subtitle = 'LONG DISTANCE PHOTO AUTOMAT',
    date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    filterType = 'normal',
    themeType = 'cream',
    stickers = [] // Array of { id, content, x, y, rotation, scale } where x,y are [0..1] across full strip
  } = options;

  const headerTitle = names || `${localName} & ${partnerName}`;
  const theme = FRAME_THEMES[themeType] || FRAME_THEMES.cream;
  const canvasFilter = FILTER_CANVAS_MAP[filterType] || 'none';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const canvasWidth = 1000;
  const canvasHeight = 2900;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Full Strip Background Fill
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Subtle Dot Grid Pattern across entire strip
  ctx.fillStyle = theme.dotColor;
  const dotSpacing = 28;
  const dotRadius = 1.2;
  for (let x = 14; x < canvasWidth; x += dotSpacing) {
    for (let y = 14; y < canvasHeight; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Strip Layout Dimensions
  const outerMarginX = 55;
  const topHeaderHeight = 210;
  const bottomFooterHeight = 160;
  const rowGap = 16;
  const innerPhotoGap = 14;

  const totalGridHeight = canvasHeight - topHeaderHeight - bottomFooterHeight;
  const singleRowHeight = (totalGridHeight - (rowGap * 3)) / 4;
  const singlePhotoWidth = (canvasWidth - (outerMarginX * 2) - innerPhotoGap) / 2;

  // 4. Header (Typography)
  const headerCenterY = topHeaderHeight / 2 + 10;

  ctx.fillStyle = theme.subtitleColor;
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText(subtitle.toUpperCase(), canvasWidth / 2, headerCenterY - 38);

  const nameParts = headerTitle.split('&');
  ctx.font = 'italic 700 46px "Playfair Display", Georgia, "Times New Roman", serif';
  ctx.textBaseline = 'middle';

  if (nameParts.length === 2) {
    const name1 = nameParts[0].trim() + ' ';
    const ampersand = '&';
    const name2 = ' ' + nameParts[1].trim();

    const width1 = ctx.measureText(name1).width;
    const widthAmp = ctx.measureText(ampersand).width;
    const width2 = ctx.measureText(name2).width;
    const totalWidth = width1 + widthAmp + width2;

    let startX = (canvasWidth - totalWidth) / 2;

    ctx.textAlign = 'left';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(name1, startX, headerCenterY + 12);

    startX += width1;
    ctx.fillStyle = theme.accentColor;
    ctx.fillText(ampersand, startX, headerCenterY + 12);

    startX += widthAmp;
    ctx.fillStyle = theme.textColor;
    ctx.fillText(name2, startX, headerCenterY + 12);
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(headerTitle, canvasWidth / 2, headerCenterY + 12);
  }

  function drawPhotoFrame(frameCanvas, destX, destY, destW, destH, placeholderText) {
    ctx.save();
    ctx.beginPath();
    const cornerRadius = 8;
    ctx.roundRect(destX, destY, destW, destH, cornerRadius);
    ctx.clip();

    if (frameCanvas && frameCanvas.width > 0) {
      const vw = frameCanvas.width;
      const vh = frameCanvas.height;
      const targetRatio = destW / destH;
      const srcRatio = vw / vh;

      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (srcRatio > targetRatio) {
        sw = vh * targetRatio;
        sx = (vw - sw) / 2;
      } else {
        sh = vw / targetRatio;
        sy = (vh - sh) / 2;
      }

      ctx.filter = canvasFilter;
      ctx.drawImage(frameCanvas, sx, sy, sw, sh, destX, destY, destW, destH);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#292524';
      ctx.fillRect(destX, destY, destW, destH);
      ctx.fillStyle = '#a8a29e';
      ctx.font = '500 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(placeholderText || 'No Signal', destX + destW / 2, destY + destH / 2);
    }

    ctx.restore();

    ctx.strokeStyle = theme.photoBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(destX, destY, destW, destH, cornerRadius);
    ctx.stroke();
  }

  // 5. 4 Photo Rows
  for (let i = 0; i < 4; i++) {
    const shot = (shotsArray && shotsArray[i]) || { localCanvas: null, remoteCanvas: null };
    const rowY = topHeaderHeight + i * (singleRowHeight + rowGap);

    const leftPhotoX = outerMarginX;
    const rightPhotoX = outerMarginX + singlePhotoWidth + innerPhotoGap;

    drawPhotoFrame(shot.localCanvas, leftPhotoX, rowY, singlePhotoWidth, singleRowHeight, localName);
    drawPhotoFrame(shot.remoteCanvas, rightPhotoX, rowY, singlePhotoWidth, singleRowHeight, partnerName);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`0${i + 1}`, rightPhotoX + singlePhotoWidth - 8, rowY + singleRowHeight - 8);
    ctx.restore();
  }

  // 6. Footer
  const footerCenterY = canvasHeight - (bottomFooterHeight / 2);
  ctx.fillStyle = theme.footerDateColor;
  ctx.font = 'italic 500 24px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`•  ${date}  •`, canvasWidth / 2, footerCenterY - 14);

  ctx.fillStyle = theme.footerTagColor;
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('HEART TO HEART • DISTANCE IS NOTHING', canvasWidth / 2, footerCenterY + 22);

  // 7. Render Unrestricted Full-Strip Interactive Stickers
  // Placed anywhere from (0,0) top-left margin to (1000, 2900) bottom-right footer
  if (Array.isArray(stickers) && stickers.length > 0) {
    stickers.forEach((st) => {
      const cx = (st.x ?? 0.5) * canvasWidth;
      const cy = (st.y ?? 0.5) * canvasHeight;
      const rotation = st.rotation || 0;
      const scale = st.scale || 1.0;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      ctx.font = '76px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillText(st.content || '💖', 0, 0);

      ctx.restore();
    });
  }

  return canvas.toDataURL('image/png', 1.0);
}
