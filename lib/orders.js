export const products = [
  { id: "thinkpad", name: "ThinkPad X1", price: 1250 },
  { id: "iphone", name: "iPhone 16 Pro", price: 1100 },
  { id: "monitor", name: 'Dell 27" Monitor', price: 450 },
  { id: "mouse", name: "Logitech Mouse", price: 95 },
];
export const defaultCustomer = {
  name: "Anders Jensen",
  email: "anders@example.dk",
  country: "DK",
  postalCode: "2630",
};
export const orderPriority = (total) => (total > 1000 ? "HIGH" : "STANDARD");
export const validPostalCode = (postalCode) => /^\d{4}$/.test(postalCode);
export const eur = (value) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
const escapeXml = (value) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char] ?? char,
  );
export function orderXml(order) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<SalesOrder>\n  <OrderID>${escapeXml(order.orderId)}</OrderID>\n  <Customer>\n    <Name>${escapeXml(order.customer.name)}</Name>\n    <Email>${escapeXml(order.customer.email)}</Email>\n    <Country>${escapeXml(order.customer.country)}</Country>\n    <PostalCode>${escapeXml(order.customer.postalCode)}</PostalCode>\n  </Customer>\n  <Item>${escapeXml(order.product)}</Item>\n  <Quantity>${order.quantity}</Quantity>\n  <TotalAmount currency="EUR">${order.totalAmount.toFixed(2)}</TotalAmount>\n  <Priority>${order.priority}</Priority>\n</SalesOrder>`;
}
