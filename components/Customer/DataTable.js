"use client";
import React, { useEffect, useMemo, useState } from "react";
import css from "./Customer.module.css";
import moment from "moment";
import { generatePdf } from "./GeneratePdf";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DataTable = (props) => {
  const {
    data = [],
    distributor,
    year,
    dateRange,
    totalBags,
    customer = false,
  } = props;
  const name = distributor?.data?.firstName + " " + distributor?.data?.lastName;
  const PAGE_SIZE = 10;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfStartDate, setPdfStartDate] = useState(null);
  const [pdfEndDate, setPdfEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState(data);
  const [bagsTotal, setBagsTotal] = useState(Number(totalBags || 0));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editType, setEditType] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBags, setEditBags] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editFair, setEditFair] = useState("");
  const [editPaid, setEditPaid] = useState("");
  const [editEntryId, setEditEntryId] = useState("");
  const [openActionMenuId, setOpenActionMenuId] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState("");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    setEntries(data || []);
  }, [data]);

  useEffect(() => {
    setBagsTotal(Number(totalBags || 0));
  }, [totalBags]);

  const downloadPdfFile = async (selectedRange) => {
    const activeRange =
      selectedRange?.fromDate && selectedRange?.toDate ? selectedRange : null;

    const pdfData = activeRange
      ? oldestFirstData.filter((entry) => {
          const entryTime = new Date(entry?.date || 0).getTime();
          const fromTime = new Date(activeRange.fromDate).setHours(0, 0, 0, 0);
          const toTime = new Date(activeRange.toDate).setHours(23, 59, 59, 999);
          return entryTime >= fromTime && entryTime <= toTime;
        })
      : oldestFirstData;

    const downloadedTotalBags = pdfData.reduce(
      (sum, item) => sum + (Number(item?.bags) || 0),
      0,
    );
    const overallTotalBags = Number(bagsTotal || 0);

    const pdfBytes = await generatePdf(
      pdfData,
      distributor,
      year,
      activeRange,
      downloadedTotalBags,
      overallTotalBags,
    );

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${name}_${moment().format("DD-MM-YYYY")}.pdf`,
    );
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const openPdfModal = () => {
    if (dateRange?.fromDate && dateRange?.toDate) {
      setPdfStartDate(new Date(dateRange.fromDate));
      setPdfEndDate(new Date(dateRange.toDate));
    } else {
      setPdfStartDate(null);
      setPdfEndDate(null);
    }
    setIsPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  const handleConfirmPdfDownload = async () => {
    const selectedRange =
      pdfStartDate && pdfEndDate
        ? {
            fromDate: moment(pdfStartDate).format("YYYY-MM-DD"),
            toDate: moment(pdfEndDate).format("YYYY-MM-DD"),
          }
        : null;

    await downloadPdfFile(selectedRange);
    closePdfModal();
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
      [...entries].sort((a, b) => {
        const byDate =
          new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime();
        if (byDate !== 0) return byDate;
        return (
          new Date(a?.createdAt || 0).getTime() -
          new Date(b?.createdAt || 0).getTime()
        );
      }),
    [entries],
  );

  const latestFirstData = useMemo(
    () => [...oldestFirstData].reverse(),
    [oldestFirstData],
  );

  const currentBalance = oldestFirstData.length
    ? oldestFirstData[oldestFirstData.length - 1].balance
    : 0;
  const latestEntryId = latestFirstData?.[0]?._id
    ? String(latestFirstData[0]._id)
    : "";
  const isEditingPaidEntry =
    Number(editPaid || 0) > 0 ||
    String(editType || "").toLowerCase() === "paid";

  const totalPages = Math.max(1, Math.ceil(latestFirstData.length / PAGE_SIZE));
  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  }, [currentPage, totalPages]);

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
    // const message = [
    //   "*Jasmine Enterprises*",
    //   "----------------------",
    //   `*Date:* ${moment().format("DD-MMMM-YYYY")}`,
    //   "_Here is a summary of your account details:_",
    //   "------Breakdown-------",
    //   `*Total No of Bags:* _${totalBags || 0}_`,
    //   `*Balance:* _${currentBalance || 0}_`,
    //   "----------------------",
    //   "_Thank you for shopping with us._",
    //   "_This is an automatically generated message._",
    //   "*For any queries, please contact:* _6006034726_",
    // ].join("\n");
    const message = [
      "*🏢 JASMINE ENTERPRISES*",
      "",
      "━━━━━━━━━━━━━━━",
      `📅 *Date:* _${moment().format("DD-MMMM-YYYY")}_`,
      "📊 *Account Summary*",
      "_Here is a quick overview of your account:_",
      "━━━━━━━━━━━━━━━",
      `📦 *Total number of bags:* *${bagsTotal || 0}*`,
      `💰 *Current Balance:* *₹${currentBalance || 0}*`,
      "━━━━━━━━━━━━━━━",
      "✨ _Thank you for shopping with us!_",
      "🤖 _This is an automatically generated message._",
      "",
      "📞 *Support:* _6006034726_",
    ].join("\n");

    openWhatsApp(message);
  };

  const handleSendPdf = async () => {
    const message = [
      "*Jasmine Enterprises*",
      `*Date:* ${moment().format("DD-MM-YYYY")}`,
      `*Total number of bags:* ${bagsTotal || 0}`,
      `*Total Balance:* ${currentBalance || 0}`,
      "Thank you for shopping with us.",
      "This is an automatically generated message.",
      "*For any query, please contact 6006034726.*",
    ].join("\n");

    const didOpen = openWhatsApp(message);
    if (!didOpen) return;

    await downloadPdfFile();
  };

  const openEditModal = (entryId = "") => {
    const latestEntry = latestFirstData[0];
    if (!latestEntry) return;
    if (entryId && String(latestEntry._id) !== String(entryId)) return;

    setEditEntryId(String(latestEntry._id || ""));
    setEditType(String(latestEntry.type || ""));
    setEditDate(moment(latestEntry.date).format("YYYY-MM-DD"));
    setEditBags(String(Math.abs(Number(latestEntry.bags || 0))));
    setEditPrice(String(Number(latestEntry.price || 0)));
    setEditFair(String(Math.abs(Number(latestEntry.fair || 0))));
    setEditPaid(String(Number(latestEntry.paid || 0)));
    setEditError("");
    setOpenActionMenuId("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditError("");
  };

  const openDeleteModal = (entryId) => {
    if (!entryId || String(entryId) !== latestEntryId) return;
    setDeleteEntryId(String(entryId));
    setDeleteError("");
    setOpenActionMenuId("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteError("");
    setDeleteEntryId("");
  };

  const handleSaveLatestEntry = async () => {
    if (!distributor?.value || !editEntryId) {
      setEditError("Unable to identify latest entry.");
      return;
    }

    if (!editDate) {
      setEditError("Please select date.");
      return;
    }

    if (isEditingPaidEntry) {
      if (Number(editPaid) <= 0) {
        setEditError("Please enter a valid paid amount.");
        return;
      }
    } else if (Number(editBags) <= 0 || Number(editPrice) <= 0) {
      setEditError("Please fill date, bags, and price correctly.");
      return;
    }

    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch("/api/record", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editEntryId,
          customer: distributor.value,
          type: editType,
          date: editDate,
          bags: Number(editBags),
          price: Number(editPrice),
          fair: Number(editFair || 0),
          paid: Number(editPaid || 0),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setEditError(json?.message || "Unable to update latest entry.");
        return;
      }

      const updatedEntry = json?.data;
      if (!updatedEntry?._id) {
        closeEditModal();
        return;
      }

      setEntries((prev) => {
        const next = prev.map((entry) =>
          String(entry?._id) === String(updatedEntry._id)
            ? updatedEntry
            : entry,
        );
        const nextBagsTotal = next.reduce(
          (sum, entry) => sum + (Number(entry?.bags) || 0),
          0,
        );
        setBagsTotal(nextBagsTotal);
        return next;
      });

      closeEditModal();
    } catch (error) {
      setEditError("Unable to update latest entry.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteLatestEntry = async () => {
    if (!distributor?.value || !deleteEntryId) {
      setDeleteError("Unable to identify latest entry.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/record", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deleteEntryId,
          customer: distributor.value,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setDeleteError(json?.message || "Unable to delete latest entry.");
        return;
      }

      setEntries((prev) => {
        const next = prev.filter(
          (entry) => String(entry?._id) !== String(deleteEntryId),
        );
        const nextBagsTotal = next.reduce(
          (sum, entry) => sum + (Number(entry?.bags) || 0),
          0,
        );
        setBagsTotal(nextBagsTotal);
        return next;
      });

      closeDeleteModal();
    } catch (error) {
      setDeleteError("Unable to delete latest entry.");
    } finally {
      setDeleteLoading(false);
    }
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
                <br />({bagsTotal})
              </th>
              <th>Paid</th>
              <th>Price</th>
              <th>Fare</th>
              <th>Gross Total</th>
              <th>Balance</th>
              {isAdmin ? <th>Action</th> : null}
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
                {isAdmin ? (
                  <td className={css.rowActionCell}>
                    {String(data?._id || "") === latestEntryId ? (
                      <>
                        <button
                          type="button"
                          className={css.rowMenuButton}
                          onClick={() =>
                            setOpenActionMenuId((prev) =>
                              prev === String(data._id) ? "" : String(data._id),
                            )
                          }
                          aria-label="Row actions"
                        >
                          &#8942;
                        </button>
                        {openActionMenuId === String(data._id) ? (
                          <div className={css.rowMenu}>
                            <button
                              type="button"
                              className={css.rowMenuItem}
                              onClick={() => openEditModal(String(data._id))}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${css.rowMenuItem} ${css.rowMenuDelete}`}
                              onClick={() => openDeleteModal(String(data._id))}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                ) : null}
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
            {isAdmin && String(item?._id || "") === latestEntryId ? (
              <div className={css.mobileActionWrap}>
                <button
                  type="button"
                  className={css.rowMenuButton}
                  onClick={() =>
                    setOpenActionMenuId((prev) =>
                      prev === String(item._id) ? "" : String(item._id),
                    )
                  }
                  aria-label="Row actions"
                >
                  &#8942;
                </button>
                {openActionMenuId === String(item._id) ? (
                  <div className={css.mobileRowMenu}>
                    <button
                      type="button"
                      className={css.rowMenuItem}
                      onClick={() => openEditModal(String(item._id))}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`${css.rowMenuItem} ${css.rowMenuDelete}`}
                      onClick={() => openDeleteModal(String(item._id))}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
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
              <span
                className={`${css.tableCardValue} ${
                  Number(item.balance || 0) < 0
                    ? css.balanceNegativeText
                    : css.balancePositiveText
                }`}
              >
                {item.balance}
              </span>
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
          Prev
        </button>
        {visiblePages.map((item, index) => {
          if (typeof item !== "number") {
            return (
              <span key={`${item}-${index}`} className={css.paginationEllipsis}>
                ...
              </span>
            );
          }

          const isActive = currentPage === item;

          return (
            <button
              key={item}
              type="button"
              className={`${css.paginationButton} ${
                isActive ? css.paginationButtonActive : ""
              }`}
              onClick={() => setCurrentPage(item)}
              aria-current={isActive ? "page" : undefined}
            >
              {item}
            </button>
          );
        })}
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
        <div className={css.statsGroup}>
          <div
            className={`${css.statCard} ${
              Number(currentBalance || 0) < 0
                ? css.statCardDanger
                : css.statCardSuccess
            }`}
          >
            <span className={css.statLabel}>Balance</span>
            <span className={css.statValue}>
              {Number(currentBalance || 0).toLocaleString()}
            </span>
          </div>
          <div className={`${css.statCard} ${css.statCardInfo}`}>
            <span className={css.statLabel}>Total number of bags</span>
            <span className={css.statValue}>{Number(bagsTotal || 0)}</span>
          </div>
        </div>
      </div>
      <p className={css.tableNote}>Note: Entries are shown newest first.</p>
      <div className={css.summaryMeta}>
        <span className={css.summaryChip}>Years: {selectedYears}</span>
        <span className={css.summaryChip}>
          Entries: {latestFirstData.length}
        </span>
      </div>
      {customerData}
      <div className={css.actionButtons}>
        {isAdmin ? (
          <button
            type="button"
            className={css.printButton}
            onClick={openShareModal}
          >
            Send WhatsApp
          </button>
        ) : null}
        <button
          type="button"
          className={css.downloadButton}
          onClick={openPdfModal}
        >
          ⬇ Download PDF
        </button>
      </div>
      {isPdfModalOpen ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Download Customer PDF</h3>
            <p className={css.modalText}>
              Date range is optional. Leave empty to download full report.
            </p>
            <div className={css.modalField}>
              <label className={css.modalLabel}>Date</label>
              <DatePicker
                selected={pdfStartDate}
                onChange={(date) => {
                  setPdfStartDate(date);
                  setPdfEndDate(date ? new Date() : null);
                }}
                isClearable
                placeholderText="Select start date"
                wrapperClassName={css.datePickerWrapper}
                className={`${css.dateInput} ${css.datePickerInput}`}
                dateFormat="dd MMM yyyy"
                showPopperArrow={false}
                maxDate={new Date()}
              />
            </div>
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                onClick={closePdfModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={css.modalSecondary}
                onClick={() => {
                  setPdfStartDate(null);
                  setPdfEndDate(null);
                }}
              >
                Clear Range
              </button>
              <button
                type="button"
                className={css.modalShare}
                onClick={handleConfirmPdfDownload}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && isEditModalOpen ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Edit Latest Journal Entry</h3>
            <p className={css.modalText}>
              Only the most recent entry can be edited.
            </p>
            <div className={css.modalField}>
              <label className={css.modalLabel}>Type</label>
              <input
                className={css.modalInput}
                type="text"
                value={editType}
                onChange={(event) => setEditType(event.target.value)}
                placeholder="Type"
              />
            </div>
            <div className={css.modalField}>
              <label className={css.modalLabel}>Date</label>
              <input
                className={css.modalInput}
                type="date"
                value={editDate}
                onChange={(event) => setEditDate(event.target.value)}
              />
            </div>
            {isEditingPaidEntry ? (
              <div className={css.modalField}>
                <label className={css.modalLabel}>Paid Amount</label>
                <input
                  className={css.modalInput}
                  type="number"
                  value={editPaid}
                  onChange={(event) => setEditPaid(event.target.value)}
                  min="0"
                />
              </div>
            ) : (
              <>
                <div className={css.modalField}>
                  <label className={css.modalLabel}>Bags</label>
                  <input
                    className={css.modalInput}
                    type="number"
                    value={editBags}
                    onChange={(event) => setEditBags(event.target.value)}
                    min="1"
                  />
                </div>
                <div className={css.modalField}>
                  <label className={css.modalLabel}>Price</label>
                  <input
                    className={css.modalInput}
                    type="number"
                    value={editPrice}
                    onChange={(event) => setEditPrice(event.target.value)}
                    min="0"
                  />
                </div>
                <div className={css.modalField}>
                  <label className={css.modalLabel}>Fare</label>
                  <input
                    className={css.modalInput}
                    type="number"
                    value={editFair}
                    onChange={(event) => setEditFair(event.target.value)}
                    min="0"
                  />
                </div>
              </>
            )}
            {editError ? <p className={css.error}>{editError}</p> : null}
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                onClick={closeEditModal}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={css.modalShare}
                onClick={handleSaveLatestEntry}
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && isDeleteModalOpen ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Delete Latest Journal Entry</h3>
            <p className={css.modalText}>
              This will delete only the latest entry. Older entries are not
              changed.
            </p>
            {deleteError ? <p className={css.error}>{deleteError}</p> : null}
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={css.modalDelete}
                onClick={handleDeleteLatestEntry}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && isShareModalOpen ? (
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
              {/* <button
                type="button"
                className={css.modalShare}
                onClick={handleSendPdf}
              >
                PDF
              </button> */}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DataTable;
