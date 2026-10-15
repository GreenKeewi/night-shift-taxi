/* Toronto block art. Canvas2D only; paint into the static world layer once. */
(function () {
  'use strict';
  const C = {
    paving: '#d6d7bf', edge: '#f5eed4', seam: '#bbc2a8', ink: '#223c51',
    lawn: '#7fb85f', grass: '#599d51', tree: '#3b8258', leaf: '#79b957',
    blue: '#277fac', blueLight: '#55b6d3', white: '#f7f3df', red: '#e85045'
  };
  // Tiny hand-drawn 3x5 alphabet, so signs stay pixel-crisp without any font downloads.
  const FONT = {
    A:['010','101','111','101','101'], B:['110','101','110','101','110'],
    C:['011','100','100','100','011'], D:['110','101','101','101','110'],
    E:['111','100','110','100','111'], F:['111','100','110','100','100'],
    G:['011','100','101','101','011'], H:['101','101','111','101','101'],
    I:['111','010','010','010','111'], J:['001','001','001','101','010'],
    K:['101','101','110','101','101'], L:['100','100','100','100','111'],
    M:['101','111','111','101','101'], N:['101','111','111','111','101'],
    O:['010','101','101','101','010'], P:['110','101','110','100','100'],
    Q:['010','101','101','111','011'], R:['110','101','110','101','101'],
    S:['011','100','010','001','110'], T:['111','010','010','010','010'],
    U:['101','101','101','101','111'], V:['101','101','101','101','010'],
    W:['101','101','111','111','101'], X:['101','101','010','101','101'],
    Y:['101','101','010','010','010'], Z:['111','001','010','100','111'],
    "'":['1','1','0','0','0'], ' ':['0','0','0','0','0']
  };
  function rect(g, x, y, w, h, color) {
    g.fillStyle = color; g.fillRect(x, y, w, h);
  }
  function poly(g, points, color) {
    g.fillStyle = color; g.beginPath(); g.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) g.lineTo(points[i][0], points[i][1]);
    g.closePath(); g.fill();
  }
  function pixelText(g, text, x, y, scale, color) {
    g.fillStyle = color;
    for (let n = 0; n < text.length; n++) {
      const rows = FONT[text[n]] || FONT[' '];
      for (let r = 0; r < 5; r++) for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === '1') g.fillRect(x + (n * 4 + c) * scale, y + r * scale, scale, scale);
      }
    }
  }
  function sign(g, text, x, y, scale, color) {
    const w = (text.length * 4 - 1) * scale + 12;
    rect(g, x + 2, y + 3, w, 5 * scale + 10, '#899b95');
    rect(g, x, y, w, 5 * scale + 10, color || C.ink);
    rect(g, x, y, w, 2, C.white);
    pixelText(g, text, x + 6, y + 5, scale, C.white);
  }
  function octagon(g, x, y, r, color) {
    const a = r * 0.45;
    poly(g, [[x-a,y-r],[x+a,y-r],[x+r,y-a],[x+r,y+a],[x+a,y+r],[x-a,y+r],[x-r,y+a],[x-r,y-a]], color);
  }
  function tree(g, x, y, size) {
    const s = size || 1;
    rect(g, x-7*s, y+6*s, 20*s, 10*s, '#a5b699');
    rect(g, x-2*s, y, 4*s, 16*s, '#816e50');
    octagon(g, x, y, 12*s, C.tree);
    rect(g, x-8*s, y-8*s, 13*s, 11*s, C.leaf);
    rect(g, x-5*s, y-10*s, 8*s, 3*s, '#9acb6e');
  }
  function plaza(g) {
    rect(g, 0, 0, 320, 224, C.paving);
    rect(g, 0, 0, 320, 7, C.edge); rect(g, 0, 217, 320, 7, C.edge);
    rect(g, 0, 0, 7, 224, C.edge); rect(g, 313, 0, 7, 224, C.edge);
    for (let x = 32; x < 320; x += 32) rect(g, x, 7, 1, 210, C.seam);
    for (let y = 32; y < 218; y += 32) rect(g, 7, y, 306, 1, C.seam);
  }
  function stadium(g) {
    plaza(g);
    // The huge stepped oval and stacked concourses distinguish the dome from a city roof.
    poly(g, [[76,24],[244,24],[244,32],[268,32],[268,44],[288,44],[288,64],[302,64],[302,152],[286,152],[286,174],[264,174],[264,190],[64,190],[64,182],[40,182],[40,164],[22,164],[22,72],[34,72],[34,52],[54,52],[54,36],[76,36]], '#93a69e');
    poly(g, [[78,18],[238,18],[238,26],[264,26],[264,38],[284,38],[284,58],[296,58],[296,144],[280,144],[280,166],[258,166],[258,180],[64,180],[64,172],[42,172],[42,154],[24,154],[24,70],[36,70],[36,48],[56,48],[56,32],[78,32]], C.white);
    // Repeated entrance bays around the concrete lower concourse.
    for (let x = 74; x < 254; x += 18) rect(g, x, 170, 10, 7, '#789995');
    for (let y = 80; y < 143; y += 18) { rect(g, 27, y, 6, 10, '#87a5a2'); rect(g, 286, y, 6, 10, '#87a5a2'); }
    poly(g, [[82,28],[236,28],[236,36],[258,36],[258,48],[276,48],[276,66],[286,66],[286,136],[272,136],[272,154],[250,154],[250,166],[74,166],[74,158],[52,158],[52,142],[36,142],[36,76],[46,76],[46,56],[62,56],[62,40],[82,40]], '#287caa');
    // Retractable roof leaves: broad cyan panels, white steel ribs, and a central opening.
    poly(g, [[84,32],[136,32],[136,160],[78,160],[78,152],[58,152],[58,136],[42,136],[42,78],[52,78],[52,60],[68,60],[68,44],[84,44]], '#73b5d0');
    poly(g, [[218,32],[234,32],[234,40],[254,40],[254,52],[272,52],[272,70],[280,70],[280,132],[266,132],[266,150],[246,150],[246,160],[218,160]], '#4b9dc5');
    rect(g, 82, 34, 5, 124, '#bde2e8'); rect(g, 108, 32, 5, 132, '#d9e9e6');
    rect(g, 134, 30, 6, 135, C.white); rect(g, 216, 31, 6, 132, C.white);
    rect(g, 241, 44, 5, 109, '#bbdce3'); rect(g, 263, 60, 4, 74, '#9bcedd');
    // Open diamond: a navy seating bowl, vivid green grass, red-clay infield and bases.
    poly(g, [[149,48],[204,48],[220,64],[220,138],[205,150],[148,150],[132,134],[132,65]], '#254b77');
    poly(g, [[151,58],[201,58],[211,69],[211,133],[201,142],[151,142],[141,131],[141,70]], '#87bd66');
    rect(g, 143, 76, 66, 10, '#70af56'); rect(g, 143, 98, 66, 10, '#70af56');
    poly(g, [[176,87],[203,113],[176,137],[150,113]], '#bf925f');
    poly(g, [[176,98],[191,113],[176,127],[161,113]], '#77ad58');
    rect(g, 174, 95, 4, 4, C.white); rect(g, 191, 111, 4, 4, C.white);
    rect(g, 158, 111, 4, 4, C.white); rect(g, 174, 128, 4, 4, C.white);
    rect(g, 174, 111, 4, 3, '#eddbb3');
    // Small stadium scoreboard and white roof equipment keep the footprint legible at a glance.
    rect(g, 158, 48, 36, 8, C.ink); rect(g, 162, 50, 5, 3, '#f8d573');
    rect(g, 171, 50, 5, 3, '#f8d573'); rect(g, 182, 50, 8, 3, '#f8d573');
    sign(g, 'ROGERS CENTRE', 77, 193, 2, '#c84e43');
    tree(g, 20, 194, .65); tree(g, 294, 194, .65);
  }
  function aquarium(g) {
    plaza(g);
    rect(g, 15, 16, 290, 26, '#87bc70');
    tree(g, 31, 27, .72); tree(g, 287, 27, .72);
    // A low, angular silver-and-aqua building with its distinctive diagonal roof geometry.
    poly(g, [[29,64],[73,42],[263,42],[296,72],[296,166],[262,186],[58,186],[29,164]], '#91a7a1');
    poly(g, [[23,56],[68,34],[260,34],[290,64],[290,158],[256,178],[52,178],[23,156]], '#ddecdf');
    poly(g, [[31,60],[73,42],[255,42],[282,68],[282,147],[251,164],[59,164],[31,148]], '#238fa9');
    poly(g, [[73,42],[255,42],[272,58],[166,93],[40,70]], '#89dae2');
    poly(g, [[40,78],[158,101],[95,154],[39,144]], '#47bfd0');
    poly(g, [[174,100],[278,65],[278,145],[250,160],[108,160]], '#3b9abe');
    // White structural folds read as a faceted aquarium, rather than another flat blue rectangle.
    poly(g, [[35,71],[166,94],[274,57],[277,64],[171,103],[98,159],[89,156],[158,100],[34,79]], '#e4f4e6');
    rect(g, 51, 148, 52, 10, '#116b8c'); rect(g, 57, 149, 3, 8, '#9fe3e2');
    rect(g, 73, 149, 3, 8, '#9fe3e2'); rect(g, 89, 149, 3, 8, '#9fe3e2');
    // Glazed blue shark gallery. The roof graphic is an immediately recognizable shark silhouette.
    poly(g, [[167,110],[256,80],[270,83],[270,139],[247,151],[116,151]], '#15638c');
    for (let x = 164; x < 268; x += 23) rect(g, x, 111, 2, 35, '#5abace');
    // Oversized dorsal fin, pointed nose, crescent tail, and small eye.
    poly(g, [[146,130],[163,118],[185,113],[193,98],[201,114],[231,117],[243,121],[258,111],[253,126],[260,140],[242,131],[221,135],[201,134],[193,143],[188,133],[167,135]], '#b5ece7');
    poly(g, [[166,120],[191,116],[229,120],[242,125],[203,127],[181,128],[157,131]], '#79ccd9');
    rect(g, 168, 122, 3, 3, '#123f67'); rect(g, 176, 127, 5, 2, '#448da9');
    // The title sits in the front fascia and remains readable even if the surrounding city labels vanish.
    rect(g, 59, 55, 88, 22, '#174c75'); pixelText(g, "RIPLEY'S", 67, 61, 2, C.white);
    sign(g, 'AQUARIUM', 98, 190, 2, '#126b91');
    // Blue wave pavers, ticket booths and clipped corner gardens.
    rect(g, 29, 191, 39, 4, '#73baca'); rect(g, 38, 199, 35, 4, '#73baca');
    rect(g, 252, 191, 36, 4, '#73baca'); rect(g, 246, 199, 32, 4, '#73baca');
    rect(g, 274, 163, 20, 16, C.white); rect(g, 277, 164, 14, 7, '#2396b3');
    tree(g, 21, 177, .65); tree(g, 298, 183, .65);
  }
  function tower(g) {
    plaza(g);
    // Four garden quadrants leave a bright ceremonial plaza around the compact tower footprint.
    rect(g, 15, 15, 57, 47, C.lawn); rect(g, 257, 15, 48, 50, C.lawn);
    rect(g, 15, 166, 57, 43, C.lawn); rect(g, 265, 173, 40, 36, C.lawn);
    tree(g, 29, 35, .78); tree(g, 54, 49, .6); tree(g, 284, 35, .88);
    tree(g, 32, 185, .8); tree(g, 284, 192, .65);
    // A stepped diagonal silhouette describes the very tall shaft, saucer and antenna.
    // It is deliberately contained in the plaza, with no overhang into driveable streets.
    g.save(); g.translate(205, 141); g.rotate(-2.42);
    poly(g, [[-7,-13],[104,-6],[104,-14],[110,-14],[110,-20],[124,-20],[124,-14],[130,-14],[130,-5],[147,-3],[147,-2],[164,-2],[164,2],[147,2],[147,3],[130,5],[130,14],[124,14],[124,20],[110,20],[110,14],[104,14],[104,6],[-7,13]], '#879996');
    g.restore();
    // Radial paving rings and three concrete entrance wings visible below the observation pod.
    octagon(g, 205, 140, 56, '#bdc8b7'); octagon(g, 205, 140, 50, '#e7e2ca');
    poly(g, [[194,135],[157,169],[170,180],[207,148]], '#b3bdaf');
    poly(g, [[211,134],[250,165],[240,179],[201,148]], '#b3bdaf');
    rect(g, 199, 84, 13, 57, '#bcc4b2'); rect(g, 203, 85, 4, 35, '#f7f1db');
    // Eight-sided, concentric top-down SkyPod, with a red ring and dark wraparound glass.
    octagon(g, 209, 146, 39, '#7b9291');
    octagon(g, 205, 138, 39, '#b9433d');
    octagon(g, 205, 135, 37, '#ef6954');
    octagon(g, 205, 132, 33, C.white);
    octagon(g, 205, 132, 28, '#2b668b');
    octagon(g, 205, 130, 23, '#83c8d9');
    rect(g, 181, 127, 48, 3, '#e7f3e6'); rect(g, 203, 107, 3, 47, '#e7f3e6');
    octagon(g, 205, 130, 13, '#e8e8d1'); octagon(g, 205, 130, 8, '#be4b44');
    // The antenna is seen straight down: bright central mast and a tiny red beacon.
    rect(g, 202, 121, 6, 17, C.white); rect(g, 203, 119, 4, 6, C.red);
    rect(g, 204, 123, 2, 7, '#ffeec9');
    // Flag and wayfinding sign complete a distinct Toronto plaza.
    rect(g, 94, 159, 3, 31, '#809890'); rect(g, 97, 159, 25, 14, C.white);
    rect(g, 97, 159, 6, 14, C.red); rect(g, 116, 159, 6, 14, C.red);
    rect(g, 107, 162, 5, 7, C.red); rect(g, 105, 164, 9, 3, C.red);
    sign(g, 'CN TOWER', 152, 189, 2, '#bf4945');
    rect(g, 83, 196, 36, 4, '#8b7556'); rect(g, 86, 200, 4, 5, '#73796a'); rect(g, 112, 200, 4, 5, '#73796a');
  }
  const drawers = { stadium, aquarium, tower };
  function draw(ctx, landmark) {
    if (!ctx || !landmark || !drawers[landmark.type]) return;
    const { x, y, w, h } = landmark;
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;
    ctx.save();
    // Exact clipping is a safety boundary: no mark extends outside the reserved block.
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.translate(x, y); ctx.scale(w / 320, h / 224);
    drawers[landmark.type](ctx);
    ctx.restore();
  }
  window.TorontoLandmarks = Object.freeze({ draw });
})();
