/**
 * generarFactura.ts
 * Genera y descarga una factura en PDF usando jsPDF (sin servidor).
 * Instalar: npm install jspdf
 */

import jsPDF from "jspdf";

// ── Tipos ──────────────────────────────────────────────────────────────────
interface ProductoFactura {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface PedidoFactura {
  _id: string;
  cliente: string;
  telefono: string;
  fecha: string;
  hora: string;
  estado: string;
  notas?: string;
  total: number;
  productos: ProductoFactura[];
}

// ── Paleta de colores ──────────────────────────────────────────────────────
const C = {
  brand:      [251, 146, 60]  as [number, number, number], // naranja #FB923C
  brandDark:  [234, 88,  12]  as [number, number, number], // #EA580C
  dark:       [15,  23,  42]  as [number, number, number], // slate-900
  slate700:   [51,  65,  85]  as [number, number, number],
  slate500:   [100, 116, 139] as [number, number, number],
  slate200:   [226, 232, 240] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  green:      [34,  197, 94]  as [number, number, number],
  amber:      [245, 158, 15]  as [number, number, number],
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(n);

const estadoColor = (estado: string): [number, number, number] => {
  const map: Record<string, [number, number, number]> = {
    pendiente:   C.amber,
    confirmado:  C.brand,
    entregado:   C.green,
    cancelado:   [239, 68, 68],
  };
  return map[estado] ?? C.slate500;
};

// ── Generador principal ────────────────────────────────────────────────────
export function generarFactura(pedido: PedidoFactura): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210; // ancho A4
  const M = 14;  // margen lateral
  let y = 0;     // cursor vertical

  // ── 1. HEADER con fondo degradado simulado ────────────────────────────
  // Fondo oscuro del header
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 52, "F");

  // Acento naranja lateral izquierdo
  doc.setFillColor(...C.brand);
  doc.rect(0, 0, 4, 52, "F");

  // Logo / nombre negocio
  doc.setTextColor(...C.brand);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("EsmilDelicias", M + 2, 18);

  // Subtítulo
  doc.setTextColor(...C.slate200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Tu tienda de dulces y snacks favorita", M + 2, 24);

  // Etiqueta FACTURA (derecha)
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("FACTURA", W - M, 20, { align: "right" });

  // Número de pedido
  doc.setTextColor(...C.slate200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const shortId = pedido._id.slice(-8).toUpperCase();
  doc.text(`#${shortId}`, W - M, 27, { align: "right" });

  // Fecha y hora (bajo el número)
  doc.text(`${pedido.fecha}  ·  ${pedido.hora}`, W - M, 33, { align: "right" });

  // Badge de estado
  const badgeColor = estadoColor(pedido.estado);
  const badgeX = W - M - 22;
  const badgeY = 37;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(badgeX, badgeY, 22, 7, 3, 3, "F");
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(pedido.estado.toUpperCase(), badgeX + 11, badgeY + 4.8, { align: "center" });

  y = 62;

  // ── 2. DATOS DEL CLIENTE ──────────────────────────────────────────────
  // Tarjeta con borde
  doc.setDrawColor(...C.slate200);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(M, y, W - M * 2, 28, 4, 4, "FD");

  doc.setTextColor(...C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("DATOS DEL CLIENTE", M + 5, y + 7);

  // Línea divisora interna
  doc.setDrawColor(...C.slate200);
  doc.line(M, y + 10, W - M, y + 10);

  // Columna izquierda — nombre
  doc.setTextColor(...C.slate700);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Cliente", M + 5, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text(pedido.cliente, M + 5, y + 23);

  // Columna derecha — teléfono
  doc.setTextColor(...C.slate700);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Teléfono", W / 2, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text(pedido.telefono, W / 2, y + 23);

  y += 38;

  // ── 3. TABLA DE PRODUCTOS ─────────────────────────────────────────────
  // Encabezado tabla
  doc.setFillColor(...C.dark);
  doc.roundedRect(M, y, W - M * 2, 9, 2, 2, "F");

  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PRODUCTO", M + 5, y + 6);
  doc.text("CANT.", 128, y + 6, { align: "center" });
  doc.text("PRECIO UNIT.", 155, y + 6, { align: "center" });
  doc.text("SUBTOTAL", W - M - 3, y + 6, { align: "right" });

  y += 9;

  // Filas de productos
  pedido.productos.forEach((item, idx) => {
    const rowH = 9;
    const isEven = idx % 2 === 0;

    // Fondo alternado
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(M, y, W - M * 2, rowH, "F");
    }

    const subtotal = item.precio * (item.cantidad || 1);

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(item.nombre, M + 5, y + 6);
    doc.text(String(item.cantidad || 1), 128, y + 6, { align: "center" });
    doc.setTextColor(...C.slate500);
    doc.text(fmt(item.precio), 155, y + 6, { align: "center" });
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(subtotal), W - M - 3, y + 6, { align: "right" });

    // Borde inferior sutil
    doc.setDrawColor(...C.slate200);
    doc.line(M, y + rowH, W - M, y + rowH);

    y += rowH;
  });

  y += 4;

  // ── 4. TOTAL ──────────────────────────────────────────────────────────
  // Caja total con fondo naranja
  const totalBoxW = 80;
  const totalBoxX = W - M - totalBoxW;
  doc.setFillColor(...C.brand);
  doc.roundedRect(totalBoxX, y, totalBoxW, 14, 3, 3, "F");

  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL A PAGAR", totalBoxX + 6, y + 5.5);
  doc.setFontSize(14);
  doc.text(fmt(pedido.total), W - M - 4, y + 11.5, { align: "right" });

  y += 22;

  // ── 5. NOTAS (si existen) ─────────────────────────────────────────────
  if (pedido.notas) {
    doc.setDrawColor(...C.slate200);
    doc.setFillColor(255, 251, 235); // amber-50
    doc.roundedRect(M, y, W - M * 2, 0, 3, 3); // solo borde, altura dinámica

    const lines = doc.splitTextToSize(pedido.notas, W - M * 2 - 16);
    const notasH = lines.length * 5 + 12;

    doc.setFillColor(255, 251, 235);
    doc.roundedRect(M, y, W - M * 2, notasH, 3, 3, "FD");

    doc.setTextColor(...C.slate500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("NOTAS DEL PEDIDO", M + 5, y + 7);

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(lines, M + 5, y + 13);

    y += notasH + 8;
  }

  // ── 6. FOOTER ─────────────────────────────────────────────────────────
  const footerY = 280;
  doc.setDrawColor(...C.slate200);
  doc.line(M, footerY, W - M, footerY);

  doc.setTextColor(...C.slate500);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("EsmilDelicias  ·  contacto@esmildelicias.com", M, footerY + 5);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-DO", {
      day: "2-digit", month: "long", year: "numeric",
    })}`,
    W - M,
    footerY + 5,
    { align: "right" }
  );

  // Línea de acento naranja en el footer
  doc.setFillColor(...C.brand);
  doc.rect(0, 295, W, 2, "F");

  // ── 7. DESCARGA ───────────────────────────────────────────────────────
  doc.save(`factura-${shortId}.pdf`);
}
