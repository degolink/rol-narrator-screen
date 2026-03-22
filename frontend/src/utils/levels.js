// D&D 5e XP thresholds — index = level (1-indexed from index 1)
export const XP_TABLE = [
  0, // level 1
  300, // level 2
  900, // level 3
  2700, // level 4
  6500, // level 5
  14000, // level 6
  23000, // level 7
  34000, // level 8
  48000, // level 9
  64000, // level 10
  85000, // level 11
  100000, // level 12
  120000, // level 13
  140000, // level 14
  165000, // level 15
  195000, // level 16
  225000, // level 17
  265000, // level 18
  305000, // level 19
  355000, // level 20
];

/** Returns the minimum XP for a given level (1-20). */
export function minXpForLevel(level) {
  const idx = Math.max(0, Math.min(level - 1, 19));
  return XP_TABLE[idx];
}

/** Returns the level (1-20) for a given amount of XP. */
export function levelFromXp(xp) {
  let level = 1;
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}
