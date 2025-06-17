const API_URL = process.env.REACT_APP_API_URL;

// Products URLs
export const PRODUCTS_URL = `${API_URL}/products`;
export const GET_ALL_PRODUCTS_URL = PRODUCTS_URL;

// Transporters URLs
export const TRANSPORTERS_URL = `${API_URL}/transporters`;
export const GET_ALL_TRANSPORTERS_URL = TRANSPORTERS_URL;

// Customers URLs
export const CUSTOMERS_URL = `${API_URL}/customers`;
export const GET_ALL_CUSTOMERS_URL = CUSTOMERS_URL;

// Destinations URLs
export const DESTINATIONS_URL = `${API_URL}/destinations`;
export const GET_ALL_DESTINATIONS_URL = DESTINATIONS_URL;

// Inward Invoices URLs
export const INWARD_INVOICES_URL = `${API_URL}/inward-invoices`;
export const CREATE_INWARD_INVOICE_URL = INWARD_INVOICES_URL;
export const GET_ALL_INWARD_INVOICES_URL = INWARD_INVOICES_URL;
export const GET_INWARD_INVOICE_URL = `${INWARD_INVOICES_URL}/`;
export const UPDATE_INWARD_INVOICE_URL = `${INWARD_INVOICES_URL}/`;
export const DELETE_INWARD_INVOICE_URL = `${INWARD_INVOICES_URL}/`;


// Outward Invoices URLs
export const OUTWARD_INVOICES_URL = `${API_URL}/outward-invoices`;
export const CREATE_OUTWARD_INVOICE_URL = OUTWARD_INVOICES_URL;
export const GET_ALL_OUTWARD_INVOICES_URL = OUTWARD_INVOICES_URL;
export const GET_OUTWARD_INVOICE_URL = `${OUTWARD_INVOICES_URL}/`;
export const UPDATE_OUTWARD_INVOICE_URL = `${OUTWARD_INVOICES_URL}/`;
export const DELETE_OUTWARD_INVOICE_URL = `${OUTWARD_INVOICES_URL}/`;

export const STOCK_MOVEMENT_URL = `${API_URL}/stock-movement`;