/** Tiempos en milisegundos (MS) */
export const DRAG_THROTTLE_MS = 50
export const TOAST_DURATION_MS = 5000

/** Parámetros de la funcionalidad de Zoom */
export const ZOOM = {
    DEFAULT_ZOOM: 1.0,
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 2.0,
    ZOOM_INCREMENT: 0.1,
} as const

/** Limitaciones y reglas del Layout de la Grid */
export const GRID_CONSTRAINTS = {
    MIN_PRODUCTS_PER_ROW: 1,
    MAX_PRODUCTS_PER_ROW: 3,
} as const
