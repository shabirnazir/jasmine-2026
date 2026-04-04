"use client";
import React, { useEffect, useMemo, useState } from "react";
import css from "./Customer.module.css";
import moment from "moment";
import { generatePdf } from "./GeneratePdf";

const DataTable = (props) => {
  const { data = [], distributor, year, totalBags, customer = false } = props;
  const name = distributor?.data?.firstName + " " + distributor?.data?.lastName;
  const PAGE_SIZE = 10;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const downloadPdfFile = async () => {
    const pdfBytes = await generatePdf(oldestFirstData, distributor, year);

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${name}.pdf`);
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };
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
    const digitsOnly = String(whatsAppNumber || "").replace(/\D/g, "");

    if (!digitsOnly) {
      setWhatsAppError(
        "Please enter a valid WhatsApp number with country code.",
      );
      return null;
    }

    const withoutIntlPrefix = digitsOnly.startsWith("00")
      ? digitsOnly.slice(2)
      : digitsOnly;
    const sanitizedPhone =
      withoutIntlPrefix.length === 10
        ? `91${withoutIntlPrefix}`
        : withoutIntlPrefix;

    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      setWhatsAppError(
        "Please enter a valid WhatsApp number with country code.",
      );
      return null;
    }

    return sanitizedPhone;
  };

  const selectedYears = Array.isArray(year)
    ? year.map((item) => item.label || item.value).join(", ")
    : "All";

  const oldestFirstData = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
      ),
    [data],
  );

  const latestFirstData = useMemo(
    () => [...oldestFirstData].reverse(),
    [oldestFirstData],
  );

  const currentBalance = oldestFirstData.length
    ? oldestFirstData[oldestFirstData.length - 1].balance
    : 0;

  const totalPages = Math.max(1, Math.ceil(latestFirstData.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedData = useMemo(
    () => latestFirstData.slice(startIndex, startIndex + PAGE_SIZE),
    [latestFirstData, startIndex],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [distributor?.value, selectedYears, latestFirstData.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    <>
      <div className={`${css.tableContainer} ${css.desktopTable}`}>
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
            {paginatedData?.map((data, index) => (
              <tr key={data?._id}>
                <td>{startIndex + index + 1}</td>
                <td>{moment(data.date).format("DD-MM-YYYY ")}</td>

                <td className={data.type === "Paid" ? css.typePaid : undefined}>
                  {data.type || "-"}
                </td>

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
      <div className={css.mobileCards}>
        {paginatedData?.map((item, index) => (
          <article
            className={css.tableCard}
            key={item?._id || `${item?.date}-${index}`}
          >
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>S No.</span>
              <span className={css.tableCardValue}>
                {startIndex + index + 1}
              </span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Date</span>
              <span className={css.tableCardValue}>
                {moment(item.date).format("DD-MM-YYYY")}
              </span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Type</span>
              <span
                className={
                  item.type === "Paid"
                    ? `${css.tableCardValue} ${css.typePaid}`
                    : css.tableCardValue
                }
              >
                {item.type || "-"}
              </span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Bags</span>
              <span className={css.tableCardValue}>{item?.bags || "-"}</span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Paid</span>
              <span
                className={
                  item.paid
                    ? `${css.tableCardValue} ${css.paid}`
                    : css.tableCardValue
                }
              >
                {item.paid || "-"}
              </span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Price</span>
              <span className={css.tableCardValue}>{item.price || "-"}</span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Fare</span>
              <span className={css.tableCardValue}>{item.fair || "-"}</span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Gross Total</span>
              <span className={css.tableCardValue}>
                {item?.price ? item?.price * item?.bags + item.fair : "-"}
              </span>
            </div>
            <div className={css.tableCardRow}>
              <span className={css.tableCardLabel}>Balance</span>
              <span className={css.tableCardValue}>{item.balance}</span>
            </div>
          </article>
        ))}
      </div>
      <div className={css.pagination}>
        <button
          type="button"
          className={css.paginationButton}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </button>
        <span className={css.paginationInfo}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className={css.paginationButton}
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
        >
          Next
        </button>
      </div>
    </>
  );

  return (
    <div className={css.dataContainer}>
      <div className={css.distributorInfo}>
        <p className={css.distributorName}>{name || "Selected Customer"}</p>
        <p className={css.number}>
          Balance: {Number(currentBalance || 0).toLocaleString()}
        </p>
      </div>
      <p className={css.tableNote}>Note: Entries are shown newest first.</p>
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
