export interface OutwardInvoiceItem {
    productCode: string;
    quantity: number;
    imeis: string[];
  }
  
  export interface OutwardInvoice {
    invoiceNumber: string;
    invoiceDate: string; // ISO date string
    customerName: string;
    destination: string;
    transporter: string;
    docketNumber: string;
    items: OutwardInvoiceItem[];
  }