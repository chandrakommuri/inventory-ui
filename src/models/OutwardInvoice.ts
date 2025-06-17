export interface OutwardInvoiceItem {
    productId: number;
    code: string;
    description: string;
    quantity: number;
    imeis: string[];
  }
  
  export interface OutwardInvoice {
    id: number;
    invoiceNumber: string;
    invoiceDate: string; // ISO date string
    customerId: number;
    customer: string;
    destinationId: number;
    destination: string;
    transporterId: number;
    transporter: string;
    docketNumber: string;
    items: OutwardInvoiceItem[];
  }