export const COLORS = {
  // arc:     [229, 118, 220, 255],
  arc:     [185, 39, 230, 255],
  arcHot:  [255, 180, 255, 255],
  arcSel:  [255, 220, 255, 255],
  arcDim:  [185, 39, 230, 55],

  nodeBase:    [185, 39, 230, 190],
  nodeBaseHov: [255, 180, 255, 255],
  nodeBaseSel: [255, 220, 255, 255],
  nodeBorder:  [185, 39, 230, 255],

  nodeRegion:    [185, 39, 230, 190],
  nodeRegionHov: [255, 180, 255, 255],
  nodeRegionBorder: [185, 39, 230, 255],

  nodeState:    [185, 39, 230, 190],
  nodeStateHov: [255, 180, 255, 255],
  nodeStateBorder: [185, 39, 230, 255],

  ripple: [255, 180, 255],
  label:  [120, 120, 120, 200],
  labelRegion: [120, 120, 120, 200],
  labelState:  [120, 120, 120, 200],
  labelActive: [255, 255, 255, 255],
};

export const INITIAL_VIEW    = { longitude: -44.0, latitude: -22.0, zoom: 5.5, pitch: 50, bearing: 0 };
export const GROW_DURATION   = 5000;
export const HOLD_DURATION   = 500;
export const SHRINK_DURATION = 2250;
export const ACTIVE_DURATION = GROW_DURATION + HOLD_DURATION + SHRINK_DURATION;
export const PAUSE_DURATION  = ACTIVE_DURATION;
export const CYCLE_DURATION  = ACTIVE_DURATION * 2;
export const ARC_STEPS       = 3840;
export const STAGGER_DELAY = 500; // atraso entre arcos saindo do mesmo nó
