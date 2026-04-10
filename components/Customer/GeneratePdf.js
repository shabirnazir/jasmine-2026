"use client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import moment from "moment";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 36;
const USABLE_W = PAGE_W - MARGIN * 2;
const BASE_COL_W = [58, 72, 42, 42, 54, 54, 76, 68]; // Date Type Bags Fare Paid Price GrossTotal Balance
const baseTotalWidth = BASE_COL_W.reduce((sum, width) => sum + width, 0);
const scaledWidths = BASE_COL_W.map((width) =>
  Math.floor((width / baseTotalWidth) * USABLE_W),
);
const COL_W = scaledWidths.map((width, index) =>
  index === scaledWidths.length - 1
    ? USABLE_W - scaledWidths.slice(0, -1).reduce((sum, item) => sum + item, 0)
    : width,
);
const ROW_H = 22;
const HEADER_BAND = 110; // min y before new page

const navy = rgb(0.05, 0.27, 0.49);
const skyBlue = rgb(0.22, 0.64, 0.9);
const lightBlue = rgb(0.92, 0.96, 1.0);
const white = rgb(1, 1, 1);
const dark = rgb(0.07, 0.09, 0.14);
const midGray = rgb(0.55, 0.62, 0.7);
const green = rgb(0.07, 0.5, 0.26);

const colX = COL_W.reduce(
  (acc, w, i) => {
    acc.push(acc[i] + w);
    return acc;
  },
  [MARGIN],
);

export const generatePdf = async (data, distributor, year) => {
  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const customerName =
    `${distributor?.data?.firstName || ""} ${distributor?.data?.lastName || ""}`.trim() ||
    distributor?.label?.trim() ||
    "N/A";

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const usableW = USABLE_W;

  const addHeader = () => {
    // --- navy header band ---
    page.drawRectangle({
      x: 0,
      y: PAGE_H - 68,
      width: PAGE_W,
      height: 68,
      color: navy,
    });
    page.drawText("JASMINE ENTERPRISES", {
      x: MARGIN,
      y: PAGE_H - 34,
      size: 20,
      font: bold,
      color: white,
    });
    page.drawText("Muslim abad b k pora | 6006034726", {
      x: MARGIN,
      y: PAGE_H - 52,
      size: 10,
      font: regular,
      color: rgb(0.73, 0.87, 0.98),
    });

    y = PAGE_H - 80;

    // --- info section ---
    if (distributor) {
      const infoItems = [
        ["Customer", customerName],
        ["Phone", distributor.data?.phone || "N/A"],
        ["Address", distributor.data?.address || "N/A"],
        [
          "Year",
          Array.isArray(year)
            ? year.map((y) => y.label || y.value).join(", ")
            : year?.label || year?.value || "All",
        ],
        ["Generated", moment().format("DD MMM YYYY")],
      ];

      const leftItems = infoItems.slice(0, 3);
      const rightItems = infoItems.slice(3);

      leftItems.forEach(([label, value]) => {
        page.drawText(`${label}:`, {
          x: MARGIN,
          y,
          size: 9,
          font: bold,
          color: midGray,
        });
        page.drawText(String(value ?? "-"), {
          x: MARGIN + 62,
          y,
          size: 9,
          font: regular,
          color: dark,
        });
        y -= 14;
      });

      const rightStartY = PAGE_H - 80;
      rightItems.forEach(([label, value], i) => {
        const ry = rightStartY - i * 14;
        page.drawText(`${label}:`, {
          x: PAGE_W / 2,
          y: ry,
          size: 9,
          font: bold,
          color: midGray,
        });
        page.drawText(String(value ?? "-"), {
          x: PAGE_W / 2 + 62,
          y: ry,
          size: 9,
          font: regular,
          color: dark,
        });
      });
    }

    // separator line
    y -= 4;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.8, 0.87, 0.94),
    });
    y -= 6;

    // --- table header row ---
    page.drawRectangle({
      x: MARGIN,
      y: y - ROW_H + 4,
      width: usableW,
      height: ROW_H,
      color: skyBlue,
    });
    const headers = [
      "Date",
      "Type",
      "Bags",
      "Fare",
      "Paid",
      "Price",
      "Gross Total",
      "Balance",
    ];
    headers.forEach((h, i) => {
      page.drawText(h, {
        x: colX[i] + 3,
        y: y - ROW_H + 9,
        size: 9,
        font: bold,
        color: white,
      });
    });
    y -= ROW_H;
  };

  const addRow = (row, rowIndex) => {
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: MARGIN,
        y: y - ROW_H + 4,
        width: usableW,
        height: ROW_H,
        color: lightBlue,
      });
    }
    row.forEach((cell, ci) => {
      page.drawText(String(cell), {
        x: colX[ci] + 3,
        y: y - ROW_H + 8,
        size: 9,
        font: regular,
        color: dark,
      });
    });
    // bottom border
    page.drawLine({
      start: { x: MARGIN, y: y - ROW_H + 4 },
      end: { x: PAGE_W - MARGIN, y: y - ROW_H + 4 },
      thickness: 0.3,
      color: rgb(0.86, 0.9, 0.95),
    });
    y -= ROW_H;
  };

  const addNewPage = () => {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    addHeader();
  };

  addHeader();

  data.forEach((item, index) => {
    if (y < HEADER_BAND + ROW_H) addNewPage();
    const grossTotal = item?.price
      ? item.price * item.bags + (item.fair || 0)
      : "-";
    const row = [
      moment(item.date).format("DD/MM/YY"),
      item.type || "-",
      item.bags || "-",
      item.fair || "-",
      item.paid || "-",
      item.price || "-",
      grossTotal,
      item.balance || "-",
    ];
    addRow(row, index);
  });

  // --- total summary ---
  if (data.length) {
    const totalBags = data.reduce(
      (sum, item) => sum + (Number(item?.bags) || 0),
      0,
    );
    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 1,
      color: navy,
    });
    y -= 14;
    page.drawText("Total Bags:", {
      x: MARGIN,
      y,
      size: 11,
      font: bold,
      color: navy,
    });
    page.drawText(String(totalBags), {
      x: PAGE_W - MARGIN - 60,
      y,
      size: 11,
      font: bold,
      color: dark,
    });
    y -= 16;
    const lastBalance = data[data.length - 1].balance;
    page.drawText("Total Balance:", {
      x: MARGIN,
      y,
      size: 11,
      font: bold,
      color: navy,
    });
    page.drawText(String(lastBalance), {
      x: PAGE_W - MARGIN - 60,
      y,
      size: 11,
      font: bold,
      color: lastBalance < 0 ? rgb(0.7, 0.1, 0.1) : green,
    });
  }

  return await pdfDoc.save();
};
