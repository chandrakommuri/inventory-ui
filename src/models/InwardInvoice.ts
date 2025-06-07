export interface InvoiceItem {
    productCode: string;
    quantity: number;
    imeis: string[];
  }
  
export interface InwardInvoice {
    invoiceNumber: string;
    invoiceDate: string; // ISO date string
    deliveryDate: string; // ISO date string
    transporter: string;
    docketNumber: string;
    items: InvoiceItem[];
  }