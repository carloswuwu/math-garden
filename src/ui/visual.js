/* 題目視覺（ESM）：SVG 圖示、文字替代與 renderVisual。 */
import { MathCore } from './globals.js';
import { t } from './i18n.js';
import { esc, renderMath } from './format.js';

function dotsHTML(n, color) {
    var cls = 'dot';
    if (color === 'green') cls = 'dot green';
    else if (color === 'gray') cls = 'dot gray';
    var html = '';
    for (var i = 0; i < n; i++) html += '<i class="' + cls + '"></i>';
    return html;
  }

function swatchColor(key) {
    return key === 'green' ? '#34C759' : '#FF9500';
  }

function fractionSVG(n, d) {
    var size = 168, r = 72, cx = size / 2, cy = size / 2;
    var angle = (2 * Math.PI) / d;
    var start = -Math.PI / 2;
    var s = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">';
    for (var i = 0; i < d; i++) {
      var a0 = start + i * angle, a1 = a0 + angle;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var large = angle > Math.PI ? 1 : 0;
      var fill = i < n ? '#FF9500' : '#E5E5EA';
      s += '<path d="M' + cx + ',' + cy + ' L' + x0.toFixed(2) + ',' + y0.toFixed(2) +
        ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' Z" fill="' + fill + '" stroke="#FFFFFF" stroke-width="2"/>';
    }
    s += '</svg>';
    return s;
  }

  /* 圖示的文字替代：屏幕閱讀器會讀出圖中表達的內容；未能描述的圖示標為裝飾性 */
function visualAlt(visual, math) {
    var v = visual || {};
    var tpl = function (key, tokens) { return t('a11y.visual.' + key, tokens || {}); };
    switch (v.kind) {
      case 'count': return tpl('count', { n: v.n });
      case 'compare': return tpl('compare', { a: v.a, b: v.b });
      case 'counters': return tpl('counters', { a: v.a, b: v.b, op: (math && math.op) || '+' });
      case 'grid': return tpl('grid', { a: v.a, b: v.b });
      case 'fraction': return tpl('fraction', { n: v.n, d: v.d });
      case 'triangle': return tpl('triangle', { b: v.b, h: v.h });
      case 'circle': return tpl('circle', { r: v.r });
      case 'cuboid': return tpl('cuboid', { l: v.l, w: v.w, h: v.h });
      case 'plane': return tpl('plane');
      case 'rect': return tpl('rect', { l: v.l, w: v.w });
      case 'compass': return tpl('compass');
      case 'cone': return tpl('cone');
      case 'sphere': return tpl('sphere');
      case 'pie': return tpl('pie', { pct: v.pct });
      case 'cylinder': return tpl('cylinder');
      case 'symmetry': return tpl('symmetry');
      case 'righttri': return tpl('righttri');
      case 'polygon': return tpl('polygon', { n: v.n });
      case 'parallelogram': return tpl('parallelogram', { b: v.b, h: v.h });
      case 'trapezoid': return tpl('trapezoid', { a: v.a, b: v.b, h: v.h });
      case 'parallel': return tpl('parallel');
      case 'angletype': return tpl('angletype') + ' · ' + tpl('angle_' + v.kind);
      case 'quadri': return tpl('quadri');
      case 'circleang': return tpl('circleang');
      case 'clock': return tpl('clock');
      case 'numberline': return tpl('numberline');
      case 'barchart': return tpl('barchart');
      case 'linegraph': return tpl('linegraph');
      case 'matrix': return tpl('matrix', { a: v.a, b: v.b, c: v.c, d: v.d });
      case 'sinewave': return tpl('sinewave');
      case 'unitcircle': return tpl('unitcircle');
      case 'percentgrid': return tpl('percentgrid', { pct: v.pct });
      case 'twotri': return tpl('twotri');
      case 'centre': return tpl('centre');
      case 'oddeven': return tpl('oddeven');
      case 'shape': return tpl('shape') + ' · ' + tpl('shape_' + v.shape);
      default: return tpl('generic');
    }
  }

function renderVisual(container, visual, math) {
    container.innerHTML = '';
    if (!visual) {
      container.style.display = 'none';
      container.removeAttribute('role');
      container.removeAttribute('aria-label');
      container.removeAttribute('aria-hidden');
      return;
    }
    container.style.display = 'flex';
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', visualAlt(visual, math));
    container.removeAttribute('aria-hidden');
    var html = '';
    var op = math ? math.op : null;
    switch (visual.kind) {
      case 'count':
        html = '<div class="dots">' + dotsHTML(visual.n, 'orange') + '</div>';
        break;
      case 'compare': {
        var ca = visual.colorA || 'green';
        var cb = visual.colorB || 'orange';
        var colorMode = !!visual.colorA;
        var dotsOk = visual.a <= 20 && visual.b <= 20;
        var left, right;
        if (colorMode || dotsOk) {
          left = '<div class="dot-group"><div class="dots">' + dotsHTML(visual.a, ca) + '</div>' + (colorMode ? '' : '<span class="dot-label">' + visual.a + '</span>') + '</div>';
          right = '<div class="dot-group"><div class="dots">' + dotsHTML(visual.b, cb) + '</div>' + (colorMode ? '' : '<span class="dot-label">' + visual.b + '</span>') + '</div>';
        } else {
          left = '<div class="dot-group"><span class="big-num" style="color:' + swatchColor(ca) + '">' + visual.a + '</span></div>';
          right = '<div class="dot-group"><span class="big-num" style="color:' + swatchColor(cb) + '">' + visual.b + '</span></div>';
        }
        html = '<div class="compare-wrap">' + left + right + '</div>';
        break;
      }
      case 'counters':
        if (op === '−') {
          html = '<div class="dot-group"><div class="dots">' +
            dotsHTML(visual.a - visual.b, 'orange') + dotsHTML(visual.b, 'gray') +
            '</div><span class="dot-label">' + visual.a + ' − ' + visual.b + '</span></div>';
        } else {
          html = '<div class="counters-wrap">' +
            '<div class="dot-group"><div class="dots">' + dotsHTML(visual.a, 'green') + '</div><span class="dot-label">' + visual.a + '</span></div>' +
            '<span class="op-symbol">' + (op === '×' ? '×' : '+') + '</span>' +
            '<div class="dot-group"><div class="dots">' + dotsHTML(visual.b, 'orange') + '</div><span class="dot-label">' + visual.b + '</span></div>' +
            '</div>';
        }
        break;
      case 'grid':
        var cells = '';
        for (var i = 0; i < visual.a * visual.b; i++) cells += '<i class="grid-cell"></i>';
        html = '<div class="grid-wrap" style="grid-template-columns:repeat(' + visual.b + ',1fr)">' + cells + '</div>';
        break;
      case 'fraction':
        html = fractionSVG(visual.n, visual.d);
        break;
      case 'triangle':
        html = triangleSVG(visual.b, visual.h);
        break;
      case 'circle':
        html = circleSVG(visual.r);
        break;
      case 'cuboid':
        html = cuboidSVG(visual.l, visual.w, visual.h);
        break;
      case 'plane':
        html = planeSVG(visual.a, visual.b);
        break;
      case 'rect':
        html = rectSVG(visual.l, visual.w);
        break;
      case 'compass':
        html = compassSVG();
        break;
      case 'cone':
        html = coneSVG();
        break;
      case 'sphere':
        html = sphereSVG();
        break;
      case 'pie':
        html = pieSVG(visual.pct);
        break;
      case 'cylinder':
        html = cylinderSVG();
        break;
      case 'symmetry':
        html = symmetrySVG();
        break;
      case 'righttri':
        html = righttriSVG();
        break;
      case 'parallelogram':
        html = parallelogramSVG(visual.b, visual.h);
        break;
      case 'trapezoid':
        html = trapezoidSVG(visual.a, visual.b, visual.h);
        break;
      case 'polygon':
        html = polygonSVG(visual.n);
        break;
      case 'parallel':
        html = parallelSVG();
        break;
      case 'angletype':
        html = angletypeSVG(visual.kind);
        break;
      case 'quadri':
        html = quadriSVG(visual.kind);
        break;
      case 'circleang':
        html = circleangSVG();
        break;
      case 'clock':
        html = clockSVG();
        break;
      case 'numberline':
        html = numberlineSVG();
        break;
      case 'barchart':
        html = barchartSVG(visual.values, visual.labels);
        break;
      case 'linegraph':
        html = linegraphSVG(visual.values, visual.labels);
        break;
      case 'matrix':
        html = matrixHTML(visual);
        break;
      case 'sinewave':
        html = sinewaveSVG();
        break;
      case 'unitcircle':
        html = unitcircleSVG();
        break;
      case 'percentgrid':
        html = percentgridSVG(visual.pct);
        break;
      case 'twotri':
        html = twotriSVG();
        break;
      case 'centre':
        html = centreSVG();
        break;
      case 'oddeven':
        html = oddevenSVG();
        break;
      case 'shape':
        html = shapeSVG(visual.shape);
        break;
    }
    container.innerHTML = html;
  }

function triangleSVG(b, h) {
    var W = 300, H = 210, pad = 42;
    var s = Math.min((W - 2 * pad) / b, (H - 2 * pad) / h);
    var bw = b * s, hh = h * s;
    var x0 = pad, y0 = H - pad, x1 = x0 + bw;
    var apexX = x0 + bw * 0.35, apexY = y0 - hh;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + x0 + ',' + y0 + ' ' + x1 + ',' + y0 + ' ' + apexX + ',' + apexY + '" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + apexX + '" y2="' + y0 + '" stroke="#007AFF" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="' + ((x0 + x1) / 2) + '" y="' + (y0 + 22) + '" text-anchor="middle" font-size="14" fill="#333">底 = ' + b + ' cm</text>' +
      '<text x="' + (apexX + 8) + '" y="' + ((apexY + y0) / 2) + '" font-size="14" fill="#007AFF">高 = ' + h + ' cm</text>' +
      '</svg>';
  }

function circleSVG(r) {
    var W = 220, H = 220, cx = 110, cy = 110, rad = 78;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + rad) + '" y2="' + cy + '" stroke="#FF9500" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#333"/>' +
      '<text x="' + (cx + rad / 2) + '" y="' + (cy - 8) + '" text-anchor="middle" font-size="14" fill="#333">r = ' + r + ' cm</text>' +
      '</svg>';
  }

function cuboidSVG(l, w, h) {
    var W = 300, H = 230, pad = 40;
    var s = Math.min((W - 2 * pad - 30) / (l + w), (H - 2 * pad - 20) / (w + h));
    var fw = w * s, fh = h * s, d = l * s * 0.55;
    var x0 = pad + d, y0 = H - pad;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + x0 + ',' + y0 + ' ' + (x0 + fw) + ',' + y0 + ' ' + (x0 + fw) + ',' + (y0 - fh) + ' ' + x0 + ',' + (y0 - fh) + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<polygon points="' + x0 + ',' + (y0 - fh) + ' ' + (x0 + d) + ',' + (y0 - fh - d) + ' ' + (x0 + fw + d) + ',' + (y0 - fh - d) + ' ' + (x0 + fw) + ',' + (y0 - fh) + '" fill="#BBDEFB" stroke="#007AFF" stroke-width="2"/>' +
      '<polygon points="' + (x0 + fw) + ',' + y0 + ' ' + (x0 + fw + d) + ',' + (y0 - d) + ' ' + (x0 + fw + d) + ',' + (y0 - fh - d) + ' ' + (x0 + fw) + ',' + (y0 - fh) + '" fill="#90CAF9" stroke="#007AFF" stroke-width="2"/>' +
      '<text x="' + (x0 + fw / 2) + '" y="' + (y0 + 20) + '" text-anchor="middle" font-size="13" fill="#333">闊 ' + w + ' cm</text>' +
      '<text x="' + (x0 - 6) + '" y="' + (y0 - fh / 2) + '" text-anchor="end" font-size="13" fill="#333">高 ' + h + ' cm</text>' +
      '<text x="' + (x0 + fw + d / 2) + '" y="' + (y0 - fh - d - 4) + '" text-anchor="middle" font-size="13" fill="#333">長 ' + l + ' cm</text>' +
      '</svg>';
  }

function planeSVG(a, b) {
    var maxX = Math.max(a[0], b[0], 5) + 2;
    var maxY = Math.max(a[1], b[1], 5) + 2;
    var W = 280, H = 240, pad = 34;
    var sx = (W - 2 * pad) / maxX, sy = (H - 2 * pad) / maxY;
    function px(x) { return pad + x * sx; }
    function py(y) { return H - pad - y * sy; }
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" stroke="#999" stroke-width="1.5"/>';
    s += '<line x1="' + pad + '" y1="' + pad + '" x2="' + pad + '" y2="' + (H - pad) + '" stroke="#999" stroke-width="1.5"/>';
    s += '<text x="' + (W - pad - 4) + '" y="' + (H - pad - 6) + '" font-size="12" fill="#666">x</text>';
    s += '<text x="' + (pad + 4) + '" y="' + (pad + 12) + '" font-size="12" fill="#666">y</text>';
    s += '<line x1="' + px(a[0]) + '" y1="' + py(a[1]) + '" x2="' + px(b[0]) + '" y2="' + py(b[1]) + '" stroke="#007AFF" stroke-width="2"/>';
    s += '<circle cx="' + px(a[0]) + '" cy="' + py(a[1]) + '" r="4" fill="#FF3B30"/>';
    s += '<text x="' + (px(a[0]) + 6) + '" y="' + (py(a[1]) + 16) + '" font-size="13" fill="#FF3B30">A(' + a[0] + ',' + a[1] + ')</text>';
    s += '<circle cx="' + px(b[0]) + '" cy="' + py(b[1]) + '" r="4" fill="#34C759"/>';
    s += '<text x="' + (px(b[0]) + 6) + '" y="' + (py(b[1]) - 8) + '" font-size="13" fill="#34C759">B(' + b[0] + ',' + b[1] + ')</text>';
    s += '</svg>';
    return s;
  }

function rectSVG(l, w) {
    var W = 280, H = 190, pad = 44;
    var s = Math.min((W - 2 * pad) / l, (H - 2 * pad) / w);
    var bw = l * s, hh = w * s;
    var x0 = (W - bw) / 2, y0 = (H - hh) / 2;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="' + x0 + '" y="' + y0 + '" width="' + bw + '" height="' + hh + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<text x="' + (W / 2) + '" y="' + (y0 + hh + 20) + '" text-anchor="middle" font-size="14" fill="#333">長 ' + l + ' cm</text>' +
      '<text x="' + (x0 - 8) + '" y="' + (y0 + hh / 2) + '" text-anchor="end" font-size="14" fill="#333">闊 ' + w + ' cm</text>' +
      '</svg>';
  }

function compassSVG() {
    var W = 220, H = 220, cx = 110, cy = 110, R = 86;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<polygon points="' + cx + ',' + (cy - R) + ' ' + (cx - 10) + ',' + (cy - 34) + ' ' + (cx + 10) + ',' + (cy - 34) + '" fill="#FF3B30"/>' +
      '<polygon points="' + cx + ',' + (cy + R) + ' ' + (cx - 10) + ',' + (cy + 34) + ' ' + (cx + 10) + ',' + (cy + 34) + '" fill="#C7C7CC"/>' +
      '<polygon points="' + (cx - R) + ',' + cy + ' ' + (cx - 34) + ',' + (cy - 10) + ' ' + (cx - 34) + ',' + (cy + 10) + '" fill="#C7C7CC"/>' +
      '<polygon points="' + (cx + R) + ',' + cy + ' ' + (cx + 34) + ',' + (cy - 10) + ' ' + (cx + 34) + ',' + (cy + 10) + '" fill="#C7C7CC"/>' +
      '<text x="' + cx + '" y="' + (cy - R - 6) + '" text-anchor="middle" font-size="16" font-weight="bold" fill="#FF3B30">北 N</text>' +
      '<text x="' + cx + '" y="' + (cy + R + 20) + '" text-anchor="middle" font-size="14" fill="#666">南 S</text>' +
      '<text x="' + (cx - R - 10) + '" y="' + (cy + 5) + '" text-anchor="end" font-size="14" fill="#666">西 W</text>' +
      '<text x="' + (cx + R + 10) + '" y="' + (cy + 5) + '" font-size="14" fill="#666">東 E</text>' +
      '</svg>';
  }

function coneSVG() {
    var W = 240, H = 220, cx = 120, topY = 28, baseY = 176;
    var apexX = cx, apexY = topY, bl = cx - 56, br = cx + 56;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + bl + '" y2="' + baseY + '" stroke="#FF9500" stroke-width="2.5"/>' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + br + '" y2="' + baseY + '" stroke="#FF9500" stroke-width="2.5"/>' +
      '<ellipse cx="' + cx + '" cy="' + baseY + '" rx="56" ry="15" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + cx + '" y2="' + baseY + '" stroke="#007AFF" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="' + (apexX + 8) + '" y="' + ((apexY + baseY) / 2) + '" font-size="13" fill="#007AFF">高 h</text>' +
      '<text x="' + cx + '" y="' + (baseY + 32) + '" text-anchor="middle" font-size="13" fill="#333">半徑 r</text>' +
      '</svg>';
  }

function sphereSVG() {
    var W = 200, H = 200, cx = 100, cy = 95, R = 70;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + R + '" ry="' + Math.round(R * 0.35) + '" fill="none" stroke="#007AFF" stroke-width="1.5"/>' +
      '<text x="' + cx + '" y="' + (cy - R - 8) + '" text-anchor="middle" font-size="13" fill="#333">半徑 r</text>' +
      '</svg>';
  }

function pieSVG(pct) {
    var W = 200, H = 200, cx = 100, cy = 100, R = 80;
    var angle = pct / 100 * 360;
    var x1 = cx, y1 = cy - R;
    var rad = angle * Math.PI / 180;
    var x2 = cx + R * Math.sin(rad);
    var y2 = cy - R * Math.cos(rad);
    var large = angle > 180 ? 1 : 0;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M ' + cx + ',' + cy + ' L ' + x1 + ',' + y1 + ' A ' + R + ',' + R + ' 0 ' + large + ' 1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) + ' Z" fill="#FFB300" stroke="#007AFF" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#007AFF" stroke-width="2"/>' +
      '<text x="' + cx + '" y="' + (cy + R + 20) + '" text-anchor="middle" font-size="15" font-weight="bold" fill="#333">' + pct + '%</text>' +
      '</svg>';
  }

function cylinderSVG() {
    var W = 200, H = 240, cx = 100, topY = 52, bottomY = 190, rx = 46, ry = 15;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="' + cx + '" cy="' + bottomY + '" rx="' + rx + '" ry="' + ry + '" fill="#BBDEFB" stroke="#007AFF" stroke-width="2"/>' +
      '<rect x="' + (cx - rx) + '" y="' + topY + '" width="' + (2 * rx) + '" height="' + (bottomY - topY) + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<ellipse cx="' + cx + '" cy="' + topY + '" rx="' + rx + '" ry="' + ry + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<text x="' + (cx - rx - 8) + '" y="' + ((topY + bottomY) / 2) + '" text-anchor="end" font-size="13" fill="#333">高 h</text>' +
      '<text x="' + (cx + rx + 8) + '" y="' + (topY + 4) + '" font-size="13" fill="#333">r</text>' +
      '</svg>';
  }

function symmetrySVG() {
    var W = 220, H = 220, cx = 110, cy = 110, s = 72;
    var x0 = cx - s, y0 = cy - s, x1 = cx + s, y1 = cy + s;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="' + x0 + '" y="' + y0 + '" width="' + (2 * s) + '" height="' + (2 * s) + '" fill="#FFF9C4" stroke="#FFB300" stroke-width="2.5"/>' +
      '<line x1="' + cx + '" y1="' + y0 + '" x2="' + cx + '" y2="' + y1 + '" stroke="#007AFF" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '<line x1="' + x0 + '" y1="' + cy + '" x2="' + x1 + '" y2="' + cy + '" stroke="#007AFF" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#FF3B30" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '<line x1="' + x1 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '" stroke="#FF3B30" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '</svg>';
  }

function righttriSVG() {
    var W = 260, H = 210, x0 = 40, y0 = 182, x1 = 230, y1 = 182, x2 = 40, y2 = 52;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + x0 + ',' + y0 + ' ' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<path d="M ' + (x0 + 20) + ',' + y0 + ' L ' + (x0 + 20) + ',' + (y0 - 20) + ' L ' + x0 + ',' + (y0 - 20) + '" fill="none" stroke="#FF9500" stroke-width="2"/>' +
      '<text x="' + ((x0 + x1) / 2) + '" y="' + (y0 + 20) + '" text-anchor="middle" font-size="14" fill="#333">a</text>' +
      '<text x="' + (x0 - 14) + '" y="' + ((y0 + y2) / 2) + '" text-anchor="end" font-size="14" fill="#333">b</text>' +
      '<text x="' + ((x1 + x2) / 2 + 12) + '" y="' + ((y0 + y2) / 2 - 8) + '" font-size="14" fill="#FF3B30">c</text>' +
      '</svg>';
  }

function polygonSVG(n) {
    var W = 220, H = 210, cx = 110, cy = 100, R = 82;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      pts.push((cx + R * Math.cos(ang)).toFixed(1) + ',' + (cy + R * Math.sin(ang)).toFixed(1));
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + pts.join(' ') + '" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-size="14" fill="#333">' + n + ' 邊形</text>' +
      '</svg>';
  }

function parallelogramSVG(b, h) {
    return '<svg width="200" height="130" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="40,105 150,105 170,25 60,25" fill="#FFD9A8" stroke="#FF9500" stroke-width="2"/>' +
      '<line x1="60" y1="25" x2="60" y2="105" stroke="#888" stroke-dasharray="4 4"/>' +
      '<text x="100" y="122" text-anchor="middle" font-size="12" fill="#333">底 ' + b + ' cm</text>' +
      '<text x="48" y="70" text-anchor="end" font-size="12" fill="#333">' + h + '</text></svg>';
  }
  function trapezoidSVG(a, b, h) {
    return '<svg width="200" height="130" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="55,105 145,105 170,25 30,25" fill="#FFD9A8" stroke="#FF9500" stroke-width="2"/>' +
      '<line x1="60" y1="25" x2="60" y2="105" stroke="#888" stroke-dasharray="4 4"/>' +
      '<text x="100" y="122" text-anchor="middle" font-size="12" fill="#333">下底 ' + b + ' cm</text>' +
      '<text x="100" y="18" text-anchor="middle" font-size="12" fill="#333">上底 ' + a + ' cm</text>' +
      '<text x="48" y="70" text-anchor="end" font-size="12" fill="#333">' + h + '</text></svg>';
  }
  function parallelSVG() {
    var W = 260, H = 200, x0 = 40, x1 = 220;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="55" x2="' + x1 + '" y2="55" stroke="#007AFF" stroke-width="3"/>' +
      '<line x1="' + x0 + '" y1="150" x2="' + x1 + '" y2="150" stroke="#007AFF" stroke-width="3"/>' +
      '<line x1="60" y1="25" x2="210" y2="180" stroke="#FF3B30" stroke-width="2.5"/>' +
      '<text x="' + (x1 - 8) + '" y="46" text-anchor="end" font-size="13" fill="#007AFF">L1</text>' +
      '<text x="' + (x1 - 8) + '" y="172" text-anchor="end" font-size="13" fill="#007AFF">L2</text>' +
      '<text x="205" y="185" font-size="13" fill="#FF3B30">截線</text>' +
      '</svg>';
  }

function angletypeSVG(kind) {
    var W = 220, H = 180, x0 = 60, y0 = 140;
    var a2 = kind === 'acute' ? 30 : kind === 'right' ? 90 : 120;
    var rad = a2 * Math.PI / 180;
    var x1 = x0 + 130, y1 = y0;
    var x2 = x0 + 130 * Math.cos(rad), y2 = y0 - 130 * Math.sin(rad);
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#007AFF" stroke-width="3"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#007AFF" stroke-width="3"/>' +
      '<path d="M ' + (x0 + 28) + ',' + y0 + ' A 28,28 0 0 ' + (a2 > 90 ? 1 : 0) + ' ' + (x0 + 28 * Math.cos(rad)).toFixed(1) + ',' + (y0 - 28 * Math.sin(rad)).toFixed(1) + '" fill="none" stroke="#FF9500" stroke-width="2"/>' +
      '<text x="' + x0 + '" y="' + (y0 + 20) + '" text-anchor="middle" font-size="14" fill="#333">' + a2 + '°</text>' +
      '</svg>';
  }

function quadriSVG(kind) {
    var W = 240, H = 180;
    if (kind === 'trap') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon points="70,40 180,40 210,140 40,140" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
        '<text x="120" y="165" text-anchor="middle" font-size="13" fill="#333">梯形</text></svg>';
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="60,40 200,40 160,140 20,140" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<text x="110" y="165" text-anchor="middle" font-size="13" fill="#333">平行四邊形</text></svg>';
  }

function circleangSVG() {
    var W = 220, H = 220, cx = 110, cy = 110, R = 80;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#007AFF" stroke-width="2.5"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R) + '" y2="' + cy + '" stroke="#FF3B30" stroke-width="2"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - R) + '" stroke="#FF3B30" stroke-width="2"/>' +
      '<path d="M ' + (cx + 24) + ',' + cy + ' A 24,24 0 0 0 ' + cx + ',' + (cy - 24) + '" fill="none" stroke="#FF9500" stroke-width="2"/>' +
      '<text x="' + (cx + 34) + '" y="' + (cy - 18) + '" font-size="13" fill="#333">圓心角</text>' +
      '<text x="' + (cx + R) + '" y="' + (cy - R + 14) + '" font-size="13" fill="#FF3B30">圓周角</text>' +
      '</svg>';
  }

function clockSVG() {
    var W = 200, H = 200, cx = 100, cy = 100, R = 78;
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#fff" stroke="#007AFF" stroke-width="3"/>';
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180;
      s += '<line x1="' + (cx + (R - 10) * Math.sin(a)).toFixed(1) + '" y1="' + (cy - (R - 10) * Math.cos(a)).toFixed(1) + '" x2="' + (cx + (R - 16) * Math.sin(a)).toFixed(1) + '" y2="' + (cy - (R - 16) * Math.cos(a)).toFixed(1) + '" stroke="#666" stroke-width="2"/>';
    }
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - R + 30) + '" stroke="#333" stroke-width="3"/>';
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R - 34) + '" y2="' + cy + '" stroke="#333" stroke-width="3"/>';
    s += '<text x="' + cx + '" y="' + (cy - R - 6) + '" text-anchor="middle" font-size="13" fill="#333">12</text>' +
      '<text x="' + (cx + R - 8) + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="12" fill="#333">3</text>' +
      '<text x="' + cx + '" y="' + (cy + R + 18) + '" text-anchor="middle" font-size="12" fill="#333">6</text>' +
      '<text x="' + (cx - R + 8) + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="12" fill="#333">9</text>';
    s += '</svg>';
    return s;
  }

function numberlineSVG() {
    var W = 280, H = 90, y = 45, x0 = 20, x1 = 260;
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#333" stroke-width="2"/>' +
      '<polygon points="' + (x1 + 6) + ',' + y + ' ' + (x1 - 2) + ',' + (y - 5) + ' ' + (x1 - 2) + ',' + (y + 5) + '" fill="#333"/>';
    for (var v = -5; v <= 5; v++) {
      var px = 140 + v * 22;
      s += '<line x1="' + px + '" y1="' + (y - 5) + '" x2="' + px + '" y2="' + (y + 5) + '" stroke="#333" stroke-width="1.5"/>' +
        '<text x="' + px + '" y="' + (y + 22) + '" text-anchor="middle" font-size="11" fill="#333">' + v + '</text>';
    }
    s += '</svg>';
    return s;
  }

function unitcircleSVG() {
    var W = 220, H = 220, cx = 110, cy = 110, r = 80;
    var ax = cx + r * Math.cos(-Math.PI / 4), ay = cy + r * Math.sin(-Math.PI / 4);
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#007AFF" stroke-width="2.5"/>' +
      '<line x1="' + (cx - r - 12) + '" y1="' + cy + '" x2="' + (cx + r + 12) + '" y2="' + cy + '" stroke="#333" stroke-width="1.5"/>' +
      '<line x1="' + cx + '" y1="' + (cy - r - 12) + '" x2="' + cx + '" y2="' + (cy + r + 12) + '" stroke="#333" stroke-width="1.5"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + ax.toFixed(1) + '" y2="' + ay.toFixed(1) + '" stroke="#FF9500" stroke-width="2.5"/>' +
      '<circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="4" fill="#FF9500"/>' +
      '<text x="' + (cx + 14) + '" y="' + (cy - 10) + '" font-size="12" fill="#333">1</text>' +
      '<text x="' + (cx - 14) + '" y="' + (cy + 18) + '" font-size="12" fill="#333">0</text></svg>';
  }

function sinewaveSVG() {
    var W = 260, H = 120, mid = 60, amp = 38, path = '';
    for (var j = 0; j < 48; j += 2) {
      var x1 = 20 + (j / 48) * (W - 40), y1 = mid - amp * Math.sin((j / 48) * Math.PI * 2);
      var x2 = 20 + ((j + 1) / 48) * (W - 40), y2 = mid - amp * Math.sin(((j + 1) / 48) * Math.PI * 2);
      path += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#007AFF" stroke-width="2.5"/>';
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="15" y1="' + mid + '" x2="' + (W - 10) + '" y2="' + mid + '" stroke="#333" stroke-width="1.5"/>' +
      '<line x1="20" y1="15" x2="20" y2="105" stroke="#333" stroke-width="1.5"/>' + path + '</svg>';
  }

function matrixHTML(v) {
    var tex = '\\begin{bmatrix}' + v.a + ' & ' + v.b + ' \\\\ ' + v.c + ' & ' + v.d + '\\end{bmatrix}';
    return '<div class="matrix-visual">' + renderMath('$$' + tex + '$$') + '</div>';
  }

function linegraphSVG(values, labels) {
    var vals = values && values.length ? values : [2, 4, 3, 6];
    var W = 240, H = 180, x0 = 35, y0 = 150, top = 20, maxV = Math.max.apply(null, vals) + 1;
    var step = (W - x0 - 20) / Math.max(1, vals.length - 1);
    var pts = vals.map(function (v, i) {
      return (x0 + i * step) + ',' + (y0 - (v / maxV) * (y0 - top));
    }).join(' ');
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - 15) + '" y2="' + y0 + '" stroke="#333" stroke-width="2"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + top + '" stroke="#333" stroke-width="2"/>' +
      '<polyline points="' + pts + '" fill="none" stroke="#007AFF" stroke-width="3"/>';
    vals.forEach(function (v, i) {
      var cx = x0 + i * step, cy = y0 - (v / maxV) * (y0 - top);
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#007AFF"/>';
      s += '<text x="' + cx + '" y="' + (y0 + 16) + '" text-anchor="middle" font-size="11" fill="#333">' + ((labels && labels[i]) || (i + 1)) + '</text>';
    });
    return s + '</svg>';
  }

  function barchartSVG(values, labels) {
    var W = 220, H = 170, x0 = 40, y0 = 140;
    var vals = values && values.length ? values : [3, 5, 2, 6, 4];
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - 15) + '" y2="' + y0 + '" stroke="#333" stroke-width="2"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + 15 + '" stroke="#333" stroke-width="2"/>';
    for (var i = 0; i < vals.length; i++) {
      var bw = 24, bh = vals[i] * 18;
      var bx = x0 + 8 + i * 34;
      s += '<rect x="' + bx + '" y="' + (y0 - bh) + '" width="' + bw + '" height="' + bh + '" fill="' + (i % 2 ? '#FF9500' : '#007AFF') + '"/>';
    }
    s += '</svg>';
    return s;
  }

function percentgridSVG(pct) {
    var W = 220, H = 220, x0 = 30, y0 = 30, cell = 16, gap = 1;
    var filled = Math.round(pct); // pct 即已塗格數（0–100）
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    for (var i = 0; i < 100; i++) {
      var r = Math.floor(i / 10), c = i % 10;
      var fill = i < filled ? '#FF9500' : '#E3F2FD';
      s += '<rect x="' + (x0 + c * (cell + gap)) + '" y="' + (y0 + r * (cell + gap)) + '" width="' + cell + '" height="' + cell + '" fill="' + fill + '" stroke="#007AFF" stroke-width="0.5"/>';
    }
    s += '<text x="' + (x0 + 5 * (cell + gap)) + '" y="' + (y0 + 10 * (cell + gap) + 18) + '" text-anchor="middle" font-size="14" fill="#333">' + pct + '%</text>';
    s += '</svg>';
    return s;
  }

function twotriSVG() {
    var W = 240, H = 190;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="30,160 90,160 60,90" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<polygon points="150,160 230,160 190,70" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<text x="60" y="180" text-anchor="middle" font-size="12" fill="#333">△1</text>' +
      '<text x="190" y="180" text-anchor="middle" font-size="12" fill="#333">△2</text>' +
      '</svg>';
  }

function centreSVG() {
    var W = 220, H = 200, cx = 110;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="110,30 200,170 20,170" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<line x1="110" y1="30" x2="110" y2="170" stroke="#FF9500" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<line x1="200" y1="170" x2="65" y2="100" stroke="#34C759" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<line x1="20" y1="170" x2="155" y2="100" stroke="#FF3B30" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<circle cx="110" cy="123" r="4" fill="#FF3B30"/>' +
      '<text x="110" y="143" text-anchor="middle" font-size="12" fill="#FF3B30">心</text>' +
      '</svg>';
  }

function oddevenSVG() {
    var W = 240, H = 140;
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 5; c++) {
        s += '<circle cx="' + (40 + c * 40) + '" cy="' + (40 + r * 40) + '" r="12" fill="' + ((r * 5 + c) % 2 ? '#FF9500' : '#007AFF') + '"/>';
      }
    }
    s += '</svg>';
    return s;
  }

function shapeSVG(kind) {
    var W = 220, H = 180;
    if (kind === 'cube') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon points="80,40 180,40 180,140 80,140" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
        '<polygon points="80,40 120,20 220,20 180,40" fill="#BBDEFB" stroke="#007AFF" stroke-width="2"/>' +
        '<polygon points="180,40 220,20 220,120 180,140" fill="#90CAF9" stroke="#007AFF" stroke-width="2"/>' +
        '<text x="150" y="165" text-anchor="middle" font-size="13" fill="#333">正方體</text></svg>';
    }
    if (kind === 'square') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="50" y="30" width="120" height="120" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
        '<text x="110" y="170" text-anchor="middle" font-size="13" fill="#333">正方形</text></svg>';
    }
    if (kind === 'triangle') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon points="110,30 190,150 30,150" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
        '<text x="110" y="172" text-anchor="middle" font-size="13" fill="#333">三角形</text></svg>';
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="60" y="40" width="100" height="80" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<text x="110" y="145" text-anchor="middle" font-size="13" fill="#333">長方形</text></svg>';
  }

export { dotsHTML, swatchColor, fractionSVG, visualAlt, renderVisual };
