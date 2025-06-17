export interface InvoiceItem {
    productId: number;
    code: string;
    description: string;
    quantity: number;
    imeis: string[];
  }
  
export interface InwardInvoice {
    id: number;
    invoiceNumber: string;
    invoiceDate: string; // ISO date string
    deliveryDate: string; // ISO date string
    transporterId: number;
    transporter: string;
    docketNumber: string;
    items: InvoiceItem[];
  }