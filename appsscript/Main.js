function doGet(e) {
  console.log("Received GET request");
  
  const method = (e.parameter._method || "GET").toUpperCase();
  switch(method) {
    case "GET": return handleGet(e);
    case "DELETE": return handleDelete(e);
    default: jsonResponse({"status":"Unknown method " + method});
  }
}

function handleGet(e) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const resource = e.parameter.resource;
  const resourceId = e.parameter.resourceId;
  switch(resource) {
    case "products": {
      const productsSheet = spreadSheet.getSheetByName("PRODUCTS");
      const products = productsSheet.getDataRange().getValues();
      const responseFields = products[0].map(dbColumnToJsonField);
      const response = products.slice(1).map(row => {
        const product = {};
        responseFields.forEach((f, i) => (product[f] = String(row[i])));
        product.id = product.productCode;
        return product;
      });
      return jsonResponse(response, 200);
    }
    case "inward-invoices": {
      const inwardInvoicesSheet = spreadSheet.getSheetByName("INWARD_INVOICES");
      const inwardInvoices = inwardInvoicesSheet.getDataRange().getValues();
      const responseFields = inwardInvoices[0].map(dbColumnToJsonField);
      if(resourceId) {
        const inwardInvoice = inwardInvoices.find(r => String(r[0]).trim() === resourceId);
        if (!inwardInvoice) {
          return jsonResponse({ error: `inward-invoice ${resourceId} not found` }, 404);
        }

        const response = {};
        responseFields.forEach((f, i) => (response[f] = inwardInvoice[i]));
        response.id = response.invoiceNumber;

        const inwardInvoiceItems = spreadSheet.getSheetByName("INWARD_INVOICE_ITEMS");
        const items = inwardInvoiceItems.getDataRange().getValues()
          .filter(r => String(r[0]).trim() === resourceId)
          .map(r => ({
            productCode: String(r[1]),
            quantity: r[2],
            imeis: JSON.parse(r[3])
          }));
        response.items = items;

        return jsonResponse(response, 200);
      } else {
        const response = inwardInvoices.slice(1).map(row => {
          const inwardInvoice = {};
          responseFields.forEach((f, i) => (inwardInvoice[f] = row[i]));
          inwardInvoice.id = inwardInvoice.invoiceNumber;
          return inwardInvoice;
        });
        return jsonResponse(response, 200);
      }
    }
    case "outward-invoices": {
      const outwardInvoicesSheet = spreadSheet.getSheetByName("OUTWARD_INVOICES");
      const outwardInvoices = outwardInvoicesSheet.getDataRange().getValues();
      const responseFields = outwardInvoices[0].map(dbColumnToJsonField);
      if(resourceId) {
        const outwardInvoice = outwardInvoices.find(r => String(r[0]).trim() === resourceId);
        if (!outwardInvoice) {
          return jsonResponse({ error: `outward-invoice ${resourceId} not found` }, 404);
        }

        const response = {};
        responseFields.forEach((f, i) => (response[f] = outwardInvoice[i]));
        response.id = response.invoiceNumber;

        const outwardInvoiceItems = spreadSheet.getSheetByName("OUTWARD_INVOICE_ITEMS");
        const items = outwardInvoiceItems.getDataRange().getValues()
          .filter(r => String(r[0]).trim() === resourceId)
          .map(r => ({
            productCode: String(r[1]),
            quantity: r[2],
            imeis: JSON.parse(r[3])
          }));
        response.items = items;

        return jsonResponse(response, 200);
      } else {
        const response = outwardInvoices.slice(1).map(row => {
          const outwardInvoice = {};
          responseFields.forEach((f, i) => (outwardInvoice[f] = row[i]));
          outwardInvoice.id = outwardInvoice.invoiceNumber;
          return outwardInvoice;
        });
        return jsonResponse(response, 200);
      }
    }
  }

  return jsonResponse({"error":"Unknown resource"});
}

function handleDelete(e) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
  const resource = e.parameter.resource;
  const resourceId = e.parameter.resourceId;
  if(!resourceId) {
    return jsonResponse({"error":"resourceId not provided"});
  }

  switch(resource) {
    case "inward-invoices": {
      if (!deleteInwardInvoice(spreadSheet, resourceId)) {
        return jsonResponse({ error: `inward-invoice ${resourceId} not found` }, 404);
      }
      return jsonResponse({"status": `Successfully deleted inward-invoice ${resourceId}`}, 200);
    }
    case "outward-invoices": {
      if (!deleteOutwardInvoice(spreadSheet, resourceId)) {
        return jsonResponse({ error: `outward-invoice ${resourceId} not found` }, 404);
      }
      return jsonResponse({"status": `Successfully deleted outward-invoice ${resourceId}`}, 200);
    }
  }

  return jsonResponse({"error":"Unknown resource"});
}

function deleteInwardInvoice(spreadSheet, resourceId) {
  const inwardInvoicesSheet = spreadSheet.getSheetByName("INWARD_INVOICES");
  const inwardInvoices = inwardInvoicesSheet.getDataRange().getValues();      
  let inwardInvoiceFound = false;
  for (let i = inwardInvoices.length - 1; i > 0; i--) {
    if (String(inwardInvoices[i][0]).trim() === resourceId) {
      inwardInvoiceFound=true;
      inwardInvoicesSheet.deleteRow(i + 1);
      break;
    }
  }

  if (!inwardInvoiceFound) {
    return false;
  }
  
  const inwardInvoiceItems = spreadSheet.getSheetByName("INWARD_INVOICE_ITEMS");
  const items = inwardInvoiceItems.getDataRange().getValues();
  for (let i = items.length - 1; i > 0; i--) {
    if (String(items[i][0]).trim() === resourceId) {
      inwardInvoiceItems.deleteRow(i + 1);
    }
  }

  return true;  
}

function deleteOutwardInvoice(spreadSheet, resourceId) {
  const outwardInvoicesSheet = spreadSheet.getSheetByName("OUTWARD_INVOICES");
  const outwardInvoices = outwardInvoicesSheet.getDataRange().getValues();      
  let outwardInvoiceFound = false;
  for (let i = outwardInvoices.length - 1; i > 0; i--) {
    if (String(outwardInvoices[i][0]).trim() === resourceId) {
      outwardInvoiceFound = true;
      outwardInvoicesSheet.deleteRow(i + 1);
      break;
    }
  }

  if (!outwardInvoiceFound) {
    return false;
  }
  
  const outwardInvoiceItems = spreadSheet.getSheetByName("OUTWARD_INVOICE_ITEMS");
  const items = outwardInvoiceItems.getDataRange().getValues();
  for (let i = items.length - 1; i > 0; i--) {
    if (String(items[i][0]).trim() === resourceId) {
      outwardInvoiceItems.deleteRow(i + 1);
    }
  }      

  return true;
}

function doPost(e) {
  console.log("Received POST request");

  try {
    const method = (e.parameter._method || "POST").toUpperCase();
    switch(method) {
      case "POST": return handleCreate(e);
      case "PUT": return handleUpdate(e);
      default: jsonResponse({"status":"Unknown method " + method});
    }
  } catch(error) {
    return jsonResponse({"error": error});
  }
}

function handleCreate(e) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
  const resource = e.parameter.resource;
  const data = JSON.parse(e.parameter.payload);
  switch(resource) {
    case "inward-invoices": {
      createInwardInvoice(spreadSheet, data);
      return jsonResponse({"status":"Created inward-invoice successfully"}, 201);
    }
    case "outward-invoices": {
      createOutwardInvoice(spreadSheet, data);
      return jsonResponse({"status":"Created outward-invoice successfully"}, 201);
    }
  }
}

function createInwardInvoice(spreadSheet, data) {
  const inwardInvoices = spreadSheet.getSheetByName("INWARD_INVOICES");
  inwardInvoices.appendRow([
    data.invoiceNumber,
    data.invoiceDate,
    data.deliveryDate,
    data.transporter,
    data.docketNumber
  ]);
  const inwardInvoiceItems = spreadSheet.getSheetByName("INWARD_INVOICE_ITEMS");
  (data.items || []).forEach(item => {
    inwardInvoiceItems.appendRow([
      data.invoiceNumber,
      item.productCode,
      item.quantity,
      JSON.stringify(item.imeis || [])
    ]);
  });
}

function createOutwardInvoice(spreadSheet, data) {
  const outwardInvoices = spreadSheet.getSheetByName("OUTWARD_INVOICES");
  outwardInvoices.appendRow([
    data.invoiceNumber,
    data.invoiceDate,
    data.customerName,
    data.destination,
    data.transporter,
    data.docketNumber
  ]);
  const outwardInvoiceItems = spreadSheet.getSheetByName("OUTWARD_INVOICE_ITEMS");
  (data.items || []).forEach(item => {
    outwardInvoiceItems.appendRow([
      data.invoiceNumber,
      item.productCode,
      item.quantity,
      JSON.stringify(item.imeis || [])
    ]);
  });
}

function handleUpdate(e) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
  const resource = e.parameter.resource;
  const resourceId = e.parameter.resourceId;
  if(!resourceId) {
    return jsonResponse({"error":"resourceId not provided"});
  }

  const data = JSON.parse(e.parameter.payload);
  switch(resource) {
    case "inward-invoices": {
      if (!deleteInwardInvoice(spreadSheet, resourceId)) {
        return jsonResponse({ error: `inward-invoice ${resourceId} not found` }, 404);
      }

      createInwardInvoice(spreadSheet, data);
      return jsonResponse({"status":"Updated inward-invoice successfully"}, 200);
    }
    case "outward-invoices": {
      if (!deleteOutwardInvoice(spreadSheet, resourceId)) {
        return jsonResponse({ error: `outward-invoice ${resourceId} not found` }, 404);
      }

      createOutwardInvoice(spreadSheet, data);
      return jsonResponse({"status":"Updated outward-invoice successfully"}, 200);
    }
  }

  return jsonResponse({"error":"Unknown resource"});
}

function jsonResponse(obj, cors) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function dbColumnToJsonField(column) {
  return column.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
