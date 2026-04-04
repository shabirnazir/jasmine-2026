"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import css from "./Purchase.module.css";
import IconSpinner from "../IconSpinner/IconSpinner";
const SaleCement = (props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const options = [
    {
      value: "khyber",
      label: "Khyber",
    },
    {
      value: "max",
      label: "Max",
    },
    {
      value: "Saifco",
      label: "Saifco",
    },
    {
      value: "kiryana",
      label: "Kiryana",
    },
  ];
  const transactionOptions = [
    { value: "sale", label: "Sale" },
    { value: "return", label: "Return" },
    { value: "discount", label: "Discount" },
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [selectedCement, setSelectedCement] = useState(null);
  const [transactionType, setTransactionType] = useState(transactionOptions[0]);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [whatsAppMessage, setWhatsAppMessage] = useState("");

  useEffect(() => {
    //iffi function
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/customer`);
      const json = await res.json();
      if (res.ok) {
        const options = json.data.map((distributor) => ({
          value: distributor._id,
          label: `${distributor.firstName} ${distributor.lastName} ( ${distributor.address} ) `,
          data: distributor,
        }));
        setDistributors(options);
      }
      setLoading(false);
    })();
  }, []);

  const getSanitizedPhone = (phone) => {
    const digitsOnly = String(phone || "").replace(/\D/g, "");

    if (!digitsOnly) {
      return null;
    }

    const withoutIntlPrefix = digitsOnly.startsWith("00")
      ? digitsOnly.slice(2)
      : digitsOnly;
    const normalizedPhone =
      withoutIntlPrefix.length === 10
        ? `91${withoutIntlPrefix}`
        : withoutIntlPrefix;

    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      return null;
    }

    return normalizedPhone;
  };

  const getFormattedAmount = (value) => Number(value || 0).toLocaleString();

  const getBagLabel = (value) => {
    const bagCount = Number(value || 0);
    return `${getFormattedAmount(bagCount)} bag${bagCount === 1 ? "" : "s"}`;
  };
  const formattedDate = (dateString) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  const buildWhatsAppMessage = ({
    transactionTypeValue,
    cementLabel,
    price,
    bags,
    fair,
    amount,
    date,
    balance,
  }) => {
    if (transactionTypeValue === "discount") {
      return [
        "*Jasmine Enterprises*",
        "----------------------",
        `*Date:* _${formattedDate(date)}_`,
        `_We would like to inform you that a discount of *${getFormattedAmount(amount)}* has been applied to your account._`,
        "-----------------------",
        `*Balance:* _${getFormattedAmount(balance)}_`,
        "----------------------",
        "_Thank you for your continued support and trust in us._",
        "_This is an automatically generated message._",
        "*For any queries, please contact:* _6006034726_",
      ].join("\n");
    }

    const total = Number(price || 0) * Number(bags || 0) + Number(fair || 0);
    const actionLine =
      transactionTypeValue === "return"
        ? `_We have received your return of *${getBagLabel(bags)}* of ${cementLabel} cement._`
        : `_Thank you for purchasing *${getBagLabel(bags)}* of ${cementLabel} cement from us._`;
    const totalLabel =
      transactionTypeValue === "return" ? "*Return Amount:*" : "*Total:*";

    return [
      "*Jasmine Enterprises*",
      "----------------------",
      `*Date:* _${formattedDate(date)}_`,
      actionLine,
      "------Breakdown-------",
      fair ? `*Fare Charges:* _${getFormattedAmount(fair)}_` : null,
      `*Price:* _${getFormattedAmount(price)}_`,
      `*Number of Bags:* _${getFormattedAmount(bags)}_`,
      `${totalLabel} _${getFormattedAmount(total)}_`,
      "-----------------------",
      `*Balance:* _${getFormattedAmount(balance)}_`,
      "----------------------",
      "_We sincerely appreciate your business with us._",
      "_This is an automatically generated message._",
      "*For any queries, please contact:* _6006034726_",
    ].join("\n");
  };

  const closeWhatsAppModal = () => {
    setIsWhatsAppModalOpen(false);
    setWhatsAppNumber("");
    setWhatsAppError("");
    setWhatsAppMessage("");
  };

  const handleSendWhatsApp = () => {
    const sanitizedPhone = getSanitizedPhone(whatsAppNumber);

    if (!sanitizedPhone) {
      setWhatsAppError(
        "Please enter a valid WhatsApp number with country code.",
      );
      return;
    }

    window.open(
      `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(whatsAppMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );

    closeWhatsAppModal();
  };

  const onSubmit = async (data) => {
    if (!selectedDistributor) {
      setError("Please select customer.");
      return;
    }

    if (transactionType.value !== "discount" && !selectedCement) {
      setError("Please select cement type.");
      return;
    }

    if (transactionType.value === "discount" && Number(data.amount) <= 0) {
      setError("Please enter a valid discount amount.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    const customerPhone = selectedDistributor.data.phone;

    try {
      const res = await fetch("/api/record", {
        method: "POST",
        body: JSON.stringify({
          type:
            transactionType.value === "discount"
              ? "Discount"
              : selectedCement.value,
          transactionType: transactionType.value,
          customer: selectedDistributor.value,
          price: transactionType.value === "discount" ? 0 : data.price,
          fair: transactionType.value === "discount" ? 0 : data.fair,
          bags: transactionType.value === "discount" ? 0 : data.bags,
          amount:
            transactionType.value === "discount" ? Number(data.amount) : 0,
          date: data.date,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (res.ok) {
        if (sendWhatsApp) {
          const nextWhatsAppMessage = buildWhatsAppMessage({
            transactionTypeValue: transactionType.value,
            cementLabel:
              transactionType.value === "discount"
                ? "-"
                : selectedCement?.label || "-",
            price: data.price,
            bags: data.bags,
            fair: data.fair || 0,
            amount: data.amount,
            date: data.date,
            balance: json.balance || 0,
          });
          setWhatsAppMessage(nextWhatsAppMessage);
          setWhatsAppNumber(customerPhone ? String(customerPhone) : "");
          setWhatsAppError("");
          setIsWhatsAppModalOpen(true);
        }

        setMessage(json.message);

        reset();
        setSelectedDistributor(null);
        setSelectedCement(null);
        setTransactionType(transactionOptions[0]);
      } else {
        setError(json.message);
      }
    } catch (error) {
      setError("An error occurred while adding the customer.");
      console.log(error);
    }
    setLoading(false);
  };
  return (
    <div className={css.root}>
      <form onSubmit={handleSubmit(onSubmit)} className={css.form}>
        <h1 className={css.heading}>Cement</h1>
        {message && <p className={css.message}>{message}</p>}
        {error && <p className={css.error}>{error}</p>}
        <div className={css.formGrid}>
          <div className={css.container}>
            <label className={css.label}>Transaction</label>
            <Select
              className={css.select}
              instanceId="sale-transaction-select"
              inputId="sale-transaction-select-input"
              required
              placeholder="Select transaction"
              options={transactionOptions}
              value={transactionType}
              onChange={(selectedOption) => {
                setTransactionType(selectedOption);
              }}
            />
          </div>
          <div className={css.container}>
            <label className={css.label}>Type of Cement</label>
            <Select
              className={css.select}
              instanceId="sale-cement-select"
              inputId="sale-cement-select-input"
              name="cement"
              id="cement"
              required={transactionType.value !== "discount"}
              isDisabled={transactionType.value === "discount"}
              placeholder="Select Cement"
              options={options}
              value={selectedCement}
              onChange={(selectedOption) => {
                setSelectedCement(selectedOption);
              }}
            />
          </div>
          <div className={css.container}>
            <label className={css.label}>Customer</label>
            <Select
              className={css.select}
              instanceId="sale-customer-select"
              inputId="sale-customer-select-input"
              options={distributors}
              placeholder="Select customer"
              value={selectedDistributor}
              onChange={(selectedOption) => {
                setSelectedDistributor(selectedOption);
              }}
              required
            />

            {errors.customer && (
              <p className={css.error}>Customer name is required.</p>
            )}
          </div>
          {transactionType.value === "discount" ? (
            <div className={css.container}>
              <label className={css.label}>Discount Amount</label>
              <input
                {...register("amount", { required: true, min: 1 })}
                placeholder="Enter discount amount"
                type="number"
              />
              {errors.amount && (
                <p className={css.error}>
                  Discount amount is required and must be greater than 0.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className={css.container}>
                <label className={css.label}>Price</label>
                <input
                  {...register("price", { required: true })}
                  placeholder="Enter Price"
                  type="number"
                />

                {errors.price && (
                  <p className={css.error}>
                    Price is required and should be a number.
                  </p>
                )}
              </div>
              <div className={css.container}>
                <label className={css.label}>
                  {transactionType.value === "return"
                    ? "Bags to Return"
                    : "Bags"}
                </label>
                <input
                  {...register("bags", { required: true, min: 1 })}
                  placeholder="Enter bags"
                  type="number"
                />
                {errors.bags && (
                  <p className={css.error}>
                    Bags are required and must be greater than 0.
                  </p>
                )}
              </div>
              <div className={css.container}>
                <label className={css.label}>Fair</label>
                <input
                  {...register("fair")}
                  placeholder="Enter fair"
                  type="number"
                />

                {errors.fair && (
                  <p className={css.error}>
                    Fair is required and should be a number.
                  </p>
                )}
              </div>
            </>
          )}

          <div className={css.container}>
            <label className={css.label}>Date</label>
            <input
              {...register("date", { required: true })}
              className={css.dateInput}
              placeholder="Enter Date"
              type="date"
            />
            {errors.date && <p className={css.error}>Date is required</p>}
          </div>
          <div className={`${css.container} ${css.actions}`}>
            <label className={css.whatsAppToggle}>
              <input
                className={css.whatsAppCheckbox}
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(event) => setSendWhatsApp(event.target.checked)}
              />
              <span>Open WhatsApp message after saving this entry</span>
            </label>
            <p className={css.whatsAppHint}>
              The message will use the selected customer&apos;s saved phone
              number.
            </p>
          </div>
          <div className={`${css.container} ${css.actions}`}>
            <button type="submit" className={css.submit} disabled={loading}>
              {loading ? <IconSpinner /> : "Add Cement"}
            </button>
          </div>
        </div>
      </form>
      {isWhatsAppModalOpen ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Send WhatsApp</h3>
            <p className={css.modalText}>
              Entry saved successfully. Review the number and send the message.
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
            <div className={css.modalField}>
              <label className={css.modalLabel}>Message Preview</label>
              <textarea
                className={css.modalTextarea}
                value={whatsAppMessage}
                onChange={(event) => setWhatsAppMessage(event.target.value)}
                rows={10}
              />
            </div>
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                onClick={closeWhatsAppModal}
              >
                Close
              </button>
              <button
                type="button"
                className={css.modalSend}
                onClick={handleSendWhatsApp}
              >
                Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SaleCement;
