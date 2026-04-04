"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import css from "./Customer.module.css";
import Select from "react-select";
import IconSpinner from "../IconSpinner/IconSpinner";
const Payment = (props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [distributors, setDistributors] = useState([]);
  const [distributor, setDistributor] = useState(null);
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

  const getSanitizedPhone = (phone) => String(phone || "").replace(/\D/g, "");

  const getFormattedAmount = (value) => Number(value || 0).toLocaleString();

  const closeWhatsAppModal = () => {
    setIsWhatsAppModalOpen(false);
    setWhatsAppNumber("");
    setWhatsAppError("");
    setWhatsAppMessage("");
  };

  const handleSendWhatsApp = () => {
    const sanitizedPhone = getSanitizedPhone(whatsAppNumber);

    if (!sanitizedPhone) {
      setWhatsAppError("Please enter a valid WhatsApp number.");
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
    if (!distributor) {
      setError("Please select customer.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    const res = await fetch("/api/sale", {
      method: "POST",
      body: JSON.stringify({
        customer: distributor.value,
        date: data.date,
        amount: data.amount,
        type: "Paid",
      }),
    });

    const json = await res.json();
    if (res.ok) {
      setMessage(json.message);

      if (sendWhatsApp) {
        const customerName = `${distributor.data.firstName} ${distributor.data.lastName}`;
        const nextWhatsAppMessage = [
          "*Jasmine Enterprises*",
          `*Date:* ${data.date}`,
          `*Customer:* ${customerName}`,
          "*Entry Type:* Payment",
          `*Paid Amount:* ${getFormattedAmount(data.amount)}`,
          `*Current Balance:* ${getFormattedAmount(json.balance || 0)}`,
          "Thank you for shopping with us.",
          "This is an automatically generated message.",
          "*For any query, please contact 6006034726.*",
        ].join("\n");

        setWhatsAppMessage(nextWhatsAppMessage);
        setWhatsAppNumber(
          distributor?.data?.phone ? String(distributor.data.phone) : "",
        );
        setWhatsAppError("");
        setIsWhatsAppModalOpen(true);
      }
    }
    setLoading(false);
    reset();
    setDistributor(null);
    if (!res.ok) {
      setError(json.message);
      setTimeout(() => setError(""), 5000);
    }
    return json;
  };
  return (
    <div className={css.root}>
      <form onSubmit={handleSubmit(onSubmit)} className={css.form}>
        <h1 className={css.heading}>Payment</h1>
        {message && <p className={css.message}>{message}</p>}
        {error && <p className={css.error}>{error}</p>}
        <div className={css.container}>
          <label className={css.label}>Customer</label>
          <Select
            className={css.search}
            instanceId="payment-customer-select"
            inputId="payment-customer-select-input"
            required
            placeholder="Select Customer"
            options={distributors}
            value={distributor}
            onChange={(selectedOption) => {
              setDistributor(selectedOption);
            }}
          />

          {/* {errors.cement && (
            <p className={css.error}>Type of cement is required.</p>
          )} */}
        </div>
        <div className={css.container}>
          <label className={css.label}>date</label>
          <input
            {...register("date", { required: true })}
            className={css.dateInput}
            placeholder="Enter Amount"
            type="date"
          />
          {errors.date && <p className={css.error}>Date is Required</p>}
        </div>
        <div className={css.container}>
          <label className={css.label}>Amount</label>
          <input
            {...register("amount", { required: true })}
            placeholder="Enter Amount"
            type="number"
          />
          {errors.amount && <p className={css.error}>Amount is Required</p>}
        </div>

        <div className={css.container}>
          <label className={css.whatsAppToggle}>
            <input
              className={css.whatsAppCheckbox}
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(event) => setSendWhatsApp(event.target.checked)}
            />
            <span>Show WhatsApp message after saving payment</span>
          </label>
          <p className={css.whatsAppHint}>
            The message will use the selected customer&apos;s saved phone
            number.
          </p>
        </div>

        <div className={css.container}>
          <button type="submit" className={css.submit} disabled={loading}>
            {loading ? <IconSpinner /> : "Save"}
          </button>
        </div>
      </form>
      {isWhatsAppModalOpen ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Send WhatsApp</h3>
            <p className={css.modalText}>
              Payment saved successfully. Review the number and send the
              message.
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
                rows={9}
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
                className={css.modalShare}
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

export default Payment;
