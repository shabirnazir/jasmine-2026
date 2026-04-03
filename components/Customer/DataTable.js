"use client";
import React, { useState } from "react";
import css from "./Customer.module.css";
import moment from "moment";
import { generatePdf } from "./GeneratePdf";

const DataTable = (props) => {
  const { data = [], distributor, year, totalBags, customer = false } = props;
  const name = distributor?.data?.firstName + " " + distributor?.data?.lastName;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");

  const downloadPdfFile = async () => {
    const pdfBytes = await generatePdf(data, distributor, year);

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${name}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };
  const currentBalance = data.length ? data[data.length - 1].balance : 0;

  const openShareModal = () => {
    setWhatsAppNumber(
      distributor?.data?.phone ? String(distributor.data.phone) : "",
    );
    setWhatsAppError("");
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setWhatsAppError("");
  };

  const getSanitizedPhone = () => {
    const sanitizedPhone = whatsAppNumber.replace(/\D/g, "");
    if (!sanitizedPhone) {
      setWhatsAppError("Please enter a valid WhatsApp number.");
      return null;
    }

    return sanitizedPhone;
  };

  const selectedYears = Array.isArray(year)
    ? year.map((item) => item.label || item.value).join(", ")
    : "All";

  const openWhatsApp = (message) => {
    const sanitizedPhone = getSanitizedPhone();
    if (!sanitizedPhone) return false;

    window.open(
      `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    closeShareModal();
    return true;
  };

  const handleSendMessage = () => {
    const message = [
      "*Jasmine Enterprises*",
      `*Date:* ${moment().format("DD-MM-YYYY")}`,
      `*Customer:* ${name}`,
      `*Total Bags:* ${totalBags || 0}`,
      `*Current Balance:* ${currentBalance || 0}`,
      "Thank you for shopping with us.",
      "This is an automatically generated message.",
      "*For any query, please contact 6006034726.*",
    ].join("\n");

    openWhatsApp(message);
  };

  const handleSendPdf = async () => {
    const message = [
      "*Jasmine Enterprises*",
      `*Date:* ${moment().format("DD-MM-YYYY")}`,
      `*Customer:* ${name}`,
      `*Total Bags:* ${totalBags || 0}`,
      `*Current Balance:* ${currentBalance || 0}`,
      "Thank you for shopping with us.",
      "This is an automatically generated message.",
      "*For any query, please contact 6006034726.*",
    ].join("\n");

    const didOpen = openWhatsApp(message);
    if (!didOpen) return;

    await downloadPdfFile();
  };
  const customerData = (
    <div className={css.tableContainer}>
      <table className={css.table}>
        <thead className={css.tableHeading}>
          <tr className={css.tableRow}>
            <th>S No.</th>
            <th>Date</th>
            <th>Type</th>
            <th>
              Bags
              <br />({totalBags})
            </th>
            <th>Paid</th>
            <th>Price</th>
            <th>Fare</th>
            <th>Gross Total</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((data, index) => (
            <tr key={data?._id}>
              <td>{index + 1}</td>
              <td>{moment(data.date).format("DD-MM-YYYY ")}</td>

              <td>{data.type || "-"}</td>

              <td>{data?.bags || "-"}</td>
              <td className={data.paid ? css.paid : null}>
                {data.paid || "-"}
              </td>
              <td>{data.price || "-"}</td>
              <td>{data.fair || "-"}</td>
              <td>
                {data?.price ? data?.price * data?.bags + data.fair : "-"}
              </td>
              <td>{data.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={css.dataContainer}>
      {customerData}
      <div className={css.actionButtons}>
        <button
          type="button"
          className={css.printButton}
          onClick={openShareModal}
        >
          Send WhatsApp
        </button>
        <button
          type="button"
          className={css.downloadButton}
          onClick={() => downloadPdfFile()}
        >
          ⬇ Download PDF
        </button>
      </div>
      {isShareModalOpen ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Send WhatsApp</h3>
            <p className={css.modalText}>
              Choose whether to send a normal message or open WhatsApp after
              downloading the PDF.
            </p>
            <div className={css.modalField}>
              <label className={css.modalLabel}>WhatsApp Number</label>
              <input
                className={css.modalInput}
                type="text"
                value={whatsAppNumber}
                onChange={(event) => setWhatsAppNumber(event.target.value)}
                placeholder="Enter number with country code"
              />
              {whatsAppError ? (
                <p className={css.error}>{whatsAppError}</p>
              ) : null}
            </div>
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                onClick={closeShareModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={css.modalSecondary}
                onClick={handleSendMessage}
              >
                Normal Message
              </button>
              <button
                type="button"
                className={css.modalShare}
                onClick={handleSendPdf}
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DataTable;
