/**
 * RotBlocker visual system — "cutting room, lights down."
 *
 * The bench is the same splicing desk; the lights are off. A dark slate-green
 * field, panels lit from above, and exactly two signal colors: splice orange
 * for what gets cut, mint for what's kept.
 *
 * Tuned for long looks, not for punch. Two rules do most of the work:
 *
 * 1. The field is lifted off pure black. Near-white on near-black measures
 *    ~17:1, and at that ratio text blooms and afterimages on an emissive
 *    screen. Body copy here lands near 11:1 — crisp, without the glare.
 * 2. Accents are desaturated. Fully saturated warm hues on a dark field
 *    vibrate against it; pulling chroma down keeps the signal and drops
 *    the buzz.
 *
 * Elevation comes from surface lightness and hairlines — never drop shadows,
 * which read as mud on a dark field.
 */
export const colors = {
  /** The gate. Lifted off black so light text doesn't halate. */
  base: "#141917",
  /** One stop up — the raised panel. */
  panel: "#1A201D",
  /** Pressed / elevated panel. */
  panelHi: "#222926",
  /** Inset wells (pickers, code, webview chrome). */
  well: "#101413",

  /** Hairlines. */
  line: "#28302C",
  /** Borders that need to read as an edge, not a whisper. */
  lineStrong: "#39423D",

  /** Primary copy — ~11:1 on base. Never #fff. */
  text: "#CFD6D1",
  /** Secondary copy. ~6.9:1 on base. */
  textMuted: "#9BA5A0",
  /** Meta, footers, disabled. ~4.6:1 on base. */
  textFaint: "#7C867F",

  /** Mint — go, kept, authorized. Muted; ~7:1 on base. */
  mint: "#5FB392",
  /** Mint wash for tinted surfaces. */
  mintDim: "#1A302A",

  /** Splice orange — the cut, warnings, what's removed. ~5.4:1 on base. */
  splice: "#DD7A5E",
  /** Splice wash for tinted surfaces. */
  spliceDim: "#2E1D18",

  /** Label color for text sitting on a mint fill. */
  onMint: "#0B1310",
} as const;

/**
 * One family, three weights, plus a mono register.
 *
 * Display duty is IBM Plex Sans Bold rather than a wide display face: at
 * headline sizes on a phone, character in the letterforms costs more legibility
 * than it buys, and wide faces break long words like "RotBlocker" across lines.
 * Plex keeps its personality (the humanist grotesque details) while staying
 * readable at 15px and at 40px.
 */
export const fonts = {
  display: "IBMPlexSans_600SemiBold",
  displayExtra: "IBMPlexSans_700Bold",
  body: "IBMPlexSans_400Regular",
  bodyMed: "IBMPlexSans_500Medium",
  bodySemi: "IBMPlexSans_600SemiBold",
  /** The machine register: step numbers, status, counts, code. */
  mono: "IBMPlexMono_400Regular",
  monoMed: "IBMPlexMono_500Medium",
  monoSemi: "IBMPlexMono_600SemiBold",
} as const;

/** Splicing-bench precision: sharp corners, not app-store pills. */
export const radius = {
  sm: 3,
  md: 4,
  lg: 6,
} as const;

/** The left gutter reserved for the sprocket rail. */
export const GUTTER = 38;
