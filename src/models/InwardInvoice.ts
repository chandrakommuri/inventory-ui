export interface InvoiceItem {
    productId: number;
    code: string;
    description: string;
    quantity: number;
    damagedQuantity: number;
    imeis: string[];
    damagedImeis: string[];
  }
  
export interface InwardInvoice {
    sno: number;
    id: number;
    invoiceNumber: string;
    invoiceDate: string; // ISO date string
    deliveryDate: string; // ISO date string
    transporterId: number;
    transporter: string;
    docketNumber: string;
    damageReason: string;
    items: InvoiceItem[];
  }