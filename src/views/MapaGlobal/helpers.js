export function resolveCoords(key, locations, regions, states) {
  if (key?.startsWith('base:'))   return locations[key.slice(5)]?.coords ?? null;
  if (key?.startsWith('region:')) return regions[key.slice(7)]?.coords   ?? null;
  if (key?.startsWith('state:'))  return states[key.slice(6)]?.coords    ?? null;
  return null;
}

export function resolveLabel(key, locations, regions, states) {
  if (key?.startsWith('base:'))   return locations[key.slice(5)]?.name ?? key;
  if (key?.startsWith('region:')) return regions[key.slice(7)]?.name   ?? key;
  if (key?.startsWith('state:'))  return states[key.slice(6)]?.name    ?? key;
  return key ?? '';
}

export function nodeType(key) {
  if (key?.startsWith('region:')) return 'region';
  if (key?.startsWith('state:'))  return 'state';
  return 'base';
}
