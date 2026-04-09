export const COLORS = {
  // arc:     [229, 118, 220, 255],
  arc:     [157, 0, 255, 255],
  arcHot:  [204, 150, 255, 255],
  arcSel:  [240, 218, 250, 255],
  arcDim:  [157, 0, 255, 55],

  nodeBase:    [157, 0, 255, 190],
  nodeBaseHov: [204, 150, 255, 255],
  nodeBaseSel: [240, 218, 250, 255],
  nodeBorder:  [157, 0, 255, 255],

  nodeRegion:    [157, 0, 255, 190],
  nodeRegionHov: [204, 150, 255, 255],
  nodeRegionBorder: [157, 0, 255, 255],

  nodeState:    [157, 0, 255, 190],
  nodeStateHov: [204, 150, 255, 255],
  nodeStateBorder: [157, 0, 255, 255],

  ripple: [204, 150, 255],
  label:  [148, 163, 184, 210],
  labelRegion: [251, 191, 36, 170],
  labelState:  [56, 189, 248, 150],
  labelActive: [255, 255, 255, 255],
};

export const INITIAL_VIEW    = { longitude: -44.0, latitude: -22.0, zoom: 6.5, pitch: 50, bearing: 0 };
export const GROW_DURATION   = 5000;
export const HOLD_DURATION   = 500;
export const SHRINK_DURATION = 2250;
export const ACTIVE_DURATION = GROW_DURATION + HOLD_DURATION + SHRINK_DURATION;
export const PAUSE_DURATION  = ACTIVE_DURATION;
export const CYCLE_DURATION  = ACTIVE_DURATION * 2;
export const ARC_STEPS       = 1920;
export const STAGGER_DELAY = 500; // atraso entre arcos saindo do mesmo nó
