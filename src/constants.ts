/**
 * Status codes returned by repositories when the resource has been deleted from their sites
 * Endpoint: /api/metadata/${repository}/${identifier}
 */
export const DELETED_RESOURCE_STATUS_CODES = [
  404, // HydroShare
  410, // Zenodo
]
export const DISCOVERY_SITE_URL
  = import.meta.env.VITE_APP_DISCOVERY_PORTAL_URL || ''
export const DEFAULT_TOAST_DURATION = 3500
export const APP_URL = import.meta.env.VITE_APP_URL || ''
export const API_BASE = import.meta.env.VITE_APP_API_URL || ''
export const APP_NAME = 'CZ Hub'
