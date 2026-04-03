"use client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import moment from "moment";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 36;
const COL_W = [36, 390, 90]; // SNo Name Balance
const ROW_H = 22;
const HEADER_BAND = 100;

const navy = rgb(0.05, 0.27, 0.49);
const skyBlue = rgb(0.22, 0.64, 0.9);
const lightBlue = rgb(0.92, 0.96, 1.0);
const white = rgb(1, 1, 1);
const dark = rgb(0.07, 0.09, 0.14);
const green = rgb(0.07, 0.5, 0.26);

const colX = COL_W.reduce(
  (acc, w, i) => {
    acc.push(acc[i] + w);
    return acc;
  },
  [MARGIN],
);

export const generatePdf = async (data) => {
  const filteredData = data.filter((item) => Number(item.balance) > 0);
  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const usableW = PAGE_W - MARGIN * 2;
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
    page.drawText("Monthly Customer Balance Report", {
      x: MARGIN,
      y: PAGE_H - 52,
      size: 10,
      font: regular,
      color: rgb(0.73, 0.87, 0.98),
    });

    y = PAGE_H - 80;

    // date sub-header
    page.drawText(`Generated:`, {
      x: MARGIN,
      y,
      size: 9,
      font: bold,
      color: rgb(0.55, 0.62, 0.7),
    });
    page.drawText(moment().format("DD MMMM YYYY"), {
      x: MARGIN + 65,
      y,
      size: 9,
      font: regular,
      color: dark,
    });
    page.drawText(`Total Customers:`, {
      x: PAGE_W / 2,
      y,
      size: 9,
      font: bold,
      color: rgb(0.55, 0.62, 0.7),
    });
    page.drawText(String(filteredData.length), {
      x: PAGE_W / 2 + 100,
      y,
      size: 9,
      font: regular,
      color: dark,
    });

    y -= 10;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.8, 0.87, 0.94),
    });
    y -= 6;

    // table header
    page.drawRectangle({
      x: MARGIN,
      y: y - ROW_H + 4,
      width: usableW,
      height: ROW_H,
      color: skyBlue,
    });
    ["S No.", "Customer Name", "Balance"].forEach((h, i) => {
      page.drawText(h, {
        x: colX[i] + 3,
        y: y - ROW_H + 9,
        size: 10,
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
        size: 10,
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

  filteredData.forEach((item, index) => {
    if (y < HEADER_BAND + ROW_H) addNewPage();
    addRow([index + 1, item.label, item.balance || "0"], index);
  });

  // summary footer
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: navy,
  });
  y -= 14;
  const totalBalance = filteredData.reduce(
    (sum, item) => sum + (Number(item.balance) || 0),
    0,
  );
  page.drawText("Total Outstanding Balance:", {
    x: MARGIN,
    y,
    size: 11,
    font: bold,
    color: navy,
  });
  page.drawText(String(totalBalance), {
    x: PAGE_W - MARGIN - 80,
    y,
    size: 11,
    font: bold,
    color: totalBalance < 0 ? rgb(0.7, 0.1, 0.1) : green,
  });

  return await pdfDoc.save();
};
