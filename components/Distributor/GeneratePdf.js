"use client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import moment from "moment";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 36;
const USABLE_W = PAGE_W - MARGIN * 2;
const BASE_COL_W = [30, 62, 52, 70, 70, 60, 70]; // SNo Date Type ChalanNo Paid Price Balance
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
const HEADER_BAND = 110;

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

  const usableW = USABLE_W;
  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const addHeader = () => {
    // navy header band
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

    if (distributor) {
      const cardTopY = PAGE_H - 86;
      const cardHeight = 74;
      const cardBottomY = cardTopY - cardHeight;

      // card background
      page.drawRectangle({
        x: MARGIN,
        y: cardBottomY,
        width: USABLE_W,
        height: cardHeight,
        color: rgb(0.97, 0.98, 1),
        borderColor: rgb(0.83, 0.9, 0.97),
        borderWidth: 0.8,
      });

      // card header bar
      page.drawRectangle({
        x: MARGIN,
        y: cardTopY - 16,
        width: USABLE_W,
        height: 16,
        color: rgb(0.9, 0.95, 1),
      });

      page.drawText("DISTRIBUTOR DETAILS", {
        x: MARGIN + 8,
        y: cardTopY - 12,
        size: 8,
        font: bold,
        color: navy,
      });

      const infoItems = [
        [
          "Name",
          (distributor.label?.trim() || "N/A")
            .replace(/\s*\(.*?\)\s*$/, "")
            .trim() || "N/A",
        ],
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
      const leftX = MARGIN + 10;
      const rightX = PAGE_W / 2 + 10;
      const valueOffset = 52;
      const detailStartY = cardTopY - 32;
      const detailRowGap = 16;

      leftItems.forEach(([label, value], i) => {
        const rowY = detailStartY - i * detailRowGap;
        page.drawText(`${label}:`, {
          x: leftX,
          y: rowY,
          size: 9,
          font: bold,
          color: midGray,
        });
        page.drawText(String(value ?? "-"), {
          x: leftX + valueOffset,
          y: rowY,
          size: 9,
          font: regular,
          color: dark,
        });
      });

      rightItems.forEach(([label, value], i) => {
        const rowY = detailStartY - i * detailRowGap;
        page.drawText(`${label}:`, {
          x: rightX,
          y: rowY,
          size: 9,
          font: bold,
          color: midGray,
        });
        page.drawText(String(value ?? "-"), {
          x: rightX + valueOffset,
          y: rowY,
          size: 9,
          font: regular,
          color: dark,
        });
      });

      y = cardBottomY - 6;
    }

    // table header
    page.drawRectangle({
      x: MARGIN,
      y: y - ROW_H + 4,
      width: usableW,
      height: ROW_H,
      color: skyBlue,
    });
    ["S No.", "Date", "Type", "Chalan No.", "Paid", "Price", "Balance"].forEach(
      (h, i) => {
        page.drawText(h, {
          x: colX[i] + 3,
          y: y - ROW_H + 9,
          size: 9,
          font: bold,
          color: white,
        });
      },
    );
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
    addRow(
      [
        index + 1,
        moment(item.date).format("DD/MM/YY"),
        item.type || "-",
        item.chalan || "-",
        item.paid || "-",
        item.price || "-",
        item.balance || "-",
      ],
      index,
    );
  });

  if (data.length) {
    const lastBalance = data[data.length - 1].balance;
    y -= 8;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 1,
      color: navy,
    });
    y -= 14;
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
