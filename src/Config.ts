const API_URL = process.env.REACT_APP_API_URL;

// Products URLs
export const PRODUCTS_URL = `${API_URL}?resource=products`;
export const GET_ALL_PRODUCTS_URL = PRODUCTS_URL;

// Inward Invoices URLs
export const INWARD_INVOICES_URL = `${API_URL}?resource=inward-invoices`;
export const CREATE_INWARD_INVOICE_URL = INWARD_INVOICES_URL;
export const GET_ALL_INWARD_INVOICES_URL = INWARD_INVOICES_URL;
export const GET_INWARD_INVOICE_URL = `${INWARD_INVOICES_URL}&resourceId=`;
export const UPDATE_INWARD_INVOICE_URL = `${INWARD_INVOICES_URL}&_method=PUT&resourceId=`;
export const DELETE_INWARD_INVOICE_URL = `${INWARD_INVOICES_URL}&_method=DELETE&resourceId=`;


// Outward Invoices URLs
export const OUTWARD_INVOICES_URL = `${API_URL}?resource=outward-invoices`;
export const CREATE_OUTWARD_INVOICE_URL = OUTWARD_INVOICES_URL;
export const GET_ALL_OUTWARD_INVOICES_URL = OUTWARD_INVOICES_URL;
export const GET_OUTWARD_INVOICE_URL = `${OUTWARD_INVOICES_URL}&resourceId=`;
export const UPDATE_OUTWARD_INVOICE_URL = `${OUTWARD_INVOICES_URL}&_method=PUT&resourceId=`;
export const DELETE_OUTWARD_INVOICE_URL = `${OUTWARD_INVOICES_URL}&_method=DELETE&resourceId=`;