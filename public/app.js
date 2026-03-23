/* ============================================================
   O Cofre Numérico da Música — App Logic
   ============================================================ */

(function () {
  'use strict';

  // --- Constants ---

  /** All 12 chromatic notes */
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  /**
   * Major scale intervals in semitones from root:
   * W W H W W W H  →  0, 2, 4, 5, 7, 9, 11
   */
  const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

  /** Degree labels for display (Roman numerals with quality) */
  const DEGREE_LABELS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiº'];

  /** Numeric labels for display (Nashville Number System) */
  const NUMERIC_LABELS = ['1', '2m', '3m', '4', '5', '6m', '7º'];

  /** Chord suffixes for each degree */
  const DEGREE_SUFFIXES = ['', 'm', 'm', '', '', 'm', 'º'];

  /** SVG namespace */
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /** Dial config */
  const CX = 250;
  const CY = 250;
  const OUTER_RADIUS = 220;
  const OUTER_TEXT_RADIUS = 190;
  const INNER_RING_RADIUS = 155;
  const INNER_TEXT_RADIUS = 135;
  const TICK_OUTER = 225;
  const TICK_INNER_MAJOR = 210;
  const TICK_INNER_MINOR = 215;

  // --- State ---
  let currentRotation = 0; // in degrees (multiples of 30)
  let isAnimating = false;

  // --- DOM References ---
  const outerRingSvg = document.getElementById('outerRing');
  const innerRingSvg = document.getElementById('innerRing');
  const tonicaNote = document.getElementById('tonicaNote');
  const chordTable = document.getElementById('chordTable');
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');

  // --- Helpers ---

  /**
   * Convert polar (angle in degrees, radius) to cartesian
   * Angle 0 = top (12 o'clock), clockwise positive
   */
  function polarToXY(angleDeg, radius) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: CX + radius * Math.cos(rad),
      y: CY + radius * Math.sin(rad),
    };
  }

  function createSvgElement(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    return el;
  }

  // --- Build Outer Ring (fixed) ---

  function buildOuterRing() {
    // Background ring
    outerRingSvg.appendChild(
      createSvgElement('circle', {
        cx: CX,
        cy: CY,
        r: OUTER_RADIUS,
        fill: 'none',
        stroke: '#30363d',
        'stroke-width': '2',
      })
    );

    // Inner border of outer ring
    outerRingSvg.appendChild(
      createSvgElement('circle', {
        cx: CX,
        cy: CY,
        r: INNER_RING_RADIUS + 15,
        fill: 'none',
        stroke: '#30363d',
        'stroke-width': '1',
      })
    );

    NOTES.forEach(function (note, i) {
      var angleDeg = i * 30;

      // Tick mark
      var tickStart = polarToXY(angleDeg, TICK_INNER_MAJOR);
      var tickEnd = polarToXY(angleDeg, TICK_OUTER);
      outerRingSvg.appendChild(
        createSvgElement('line', {
          x1: tickStart.x,
          y1: tickStart.y,
          x2: tickEnd.x,
          y2: tickEnd.y,
          stroke: '#8b949e',
          'stroke-width': '2',
          'stroke-linecap': 'round',
        })
      );

      // Minor ticks (halfway)
      var minorAngle = angleDeg + 15;
      var minorStart = polarToXY(minorAngle, TICK_INNER_MINOR);
      var minorEnd = polarToXY(minorAngle, TICK_OUTER);
      outerRingSvg.appendChild(
        createSvgElement('line', {
          x1: minorStart.x,
          y1: minorStart.y,
          x2: minorEnd.x,
          y2: minorEnd.y,
          stroke: '#484f58',
          'stroke-width': '1',
          'stroke-linecap': 'round',
        })
      );

      // Note label
      var pos = polarToXY(angleDeg, OUTER_TEXT_RADIUS);
      var text = createSvgElement('text', {
        x: pos.x,
        y: pos.y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#c9d1d9',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '15',
        'font-weight': '600',
      });
      text.textContent = note;
      outerRingSvg.appendChild(text);
    });
  }

  // --- Build Inner Ring (rotatable) ---

  function buildInnerRing() {
    // Background circle for inner ring
    innerRingSvg.appendChild(
      createSvgElement('circle', {
        cx: CX,
        cy: CY,
        r: INNER_RING_RADIUS + 14,
        fill: '#161b22',
        stroke: '#30363d',
        'stroke-width': '1',
      })
    );

    innerRingSvg.appendChild(
      createSvgElement('circle', {
        cx: CX,
        cy: CY,
        r: INNER_RING_RADIUS,
        fill: 'none',
        stroke: '#30363d',
        'stroke-width': '1.5',
      })
    );

    // Place degree labels at their correct semitone positions
    var colors = [
      '#58a6ff', // I  — major (blue)
      '#bc8cff', // ii — minor (purple)
      '#bc8cff', // iii — minor (purple)
      '#58a6ff', // IV — major (blue)
      '#58a6ff', // V  — major (blue)
      '#bc8cff', // vi — minor (purple)
      '#f0883e', // viiº — dim (orange)
    ];

    MAJOR_SCALE_INTERVALS.forEach(function (semitones, i) {
      var angleDeg = semitones * 30; // each semitone = 30°

      // Small tick at degree position
      var dtStart = polarToXY(angleDeg, INNER_RING_RADIUS - 5);
      var dtEnd = polarToXY(angleDeg, INNER_RING_RADIUS + 5);
      innerRingSvg.appendChild(
        createSvgElement('line', {
          x1: dtStart.x,
          y1: dtStart.y,
          x2: dtEnd.x,
          y2: dtEnd.y,
          stroke: colors[i],
          'stroke-width': '2',
          'stroke-linecap': 'round',
          opacity: '0.8',
        })
      );

      // Degree label
      var pos = polarToXY(angleDeg, INNER_TEXT_RADIUS);
      var text = createSvgElement('text', {
        x: pos.x,
        y: pos.y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: colors[i],
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '14',
        'font-weight': '700',
        'class': 'inner-ring-text',
        'style': 'transform-origin: ' + pos.x + 'px ' + pos.y + 'px;'
      });
      text.textContent = NUMERIC_LABELS[i];
      innerRingSvg.appendChild(text);

      // Connecting dot
      var dotPos = polarToXY(angleDeg, INNER_RING_RADIUS);
      innerRingSvg.appendChild(
        createSvgElement('circle', {
          cx: dotPos.x,
          cy: dotPos.y,
          r: '3',
          fill: colors[i],
          opacity: '0.6',
        })
      );
    });
  }

  // --- Rotation Logic ---

  function getCurrentTonicIndex() {
    // I is at 0° in local coords. After rotating by currentRotation degrees,
    // I visually aligns with outer note at that angle. Each note = 30°.
    var idx = ((currentRotation % 360) + 360) % 360;
    return Math.round(idx / 30) % 12;
  }

  function rotate(direction) {
    if (isAnimating) return;
    isAnimating = true;

    // direction: +1 = right (clockwise), -1 = left (counterclockwise)
    currentRotation += direction * 30;

    innerRingSvg.style.transform = 'rotate(' + currentRotation + 'deg)';
    innerRingSvg.style.transformOrigin = 'center center';

    // Keep text upright by applying counter-rotation
    var textElements = innerRingSvg.querySelectorAll('.inner-ring-text');
    textElements.forEach(function (el) {
      el.style.transform = 'rotate(' + (-currentRotation) + 'deg)';
    });

    updateDisplay();

    setTimeout(function () {
      isAnimating = false;
    }, 400);
  }

  // --- Update Display ---

  function updateDisplay() {
    var tonicIdx = getCurrentTonicIndex();
    var tonicNote_val = NOTES[tonicIdx];

    // Update tônica display
    tonicaNote.textContent = tonicNote_val;

    // Calculate chords for each degree
    updateChordTable(tonicIdx);
  }

  function updateChordTable(tonicIdx) {
    chordTable.innerHTML = '';

    // Row 1: Numbers (Nashville)
    var numLabel = document.createElement('div');
    numLabel.className = 'chord-table__cell chord-table__cell--header chord-table__cell--label';
    numLabel.textContent = 'NÚMERO';
    chordTable.appendChild(numLabel);

    NUMERIC_LABELS.forEach(function (label) {
      var cell = document.createElement('div');
      cell.className = 'chord-table__cell chord-table__cell--header chord-table__cell--degree';
      cell.textContent = label;
      chordTable.appendChild(cell);
    });

    // Row 2: Roman Numerals
    var romLabel = document.createElement('div');
    romLabel.className = 'chord-table__cell chord-table__cell--header chord-table__cell--label';
    romLabel.textContent = 'ROMANO';
    chordTable.appendChild(romLabel);

    DEGREE_LABELS.forEach(function (label) {
      var cell = document.createElement('div');
      cell.className = 'chord-table__cell chord-table__cell--header chord-table__cell--degree';
      cell.textContent = label;
      chordTable.appendChild(cell);
    });

    // Row 3: Chords
    var chordLabel = document.createElement('div');
    chordLabel.className = 'chord-table__cell chord-table__cell--label';
    chordLabel.textContent = 'ACORDE';
    chordTable.appendChild(chordLabel);

    MAJOR_SCALE_INTERVALS.forEach(function (semitones, i) {
      var noteIdx = (tonicIdx + semitones) % 12;
      var chordName = NOTES[noteIdx] + DEGREE_SUFFIXES[i];

      var cell = document.createElement('div');
      cell.className = 'chord-table__cell chord-table__cell--chord';
      if (i === 0) {
        cell.classList.add('chord-table__cell--tonic');
      }
      cell.textContent = chordName;
      chordTable.appendChild(cell);
    });
  }

  // --- Event Listeners ---

  btnLeft.addEventListener('click', function () {
    rotate(-1);
  });

  btnRight.addEventListener('click', function () {
    rotate(1);
  });

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      rotate(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      rotate(1);
    }
  });

  // --- Init ---

  buildOuterRing();
  buildInnerRing();
  updateDisplay();
})();
