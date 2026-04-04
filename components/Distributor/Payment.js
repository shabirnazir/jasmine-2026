"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import css from "./Distributor.module.css";
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
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    //iffi function
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/distributor`);
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

  const getFormattedAmount = (value) => Number(value || 0).toLocaleString();

  const fetchBalance = async (distributorId) => {
    try {
      setBalanceLoading(true);
      const res = await fetch(`/api/balance?customerId=${distributorId}`);
      const json = await res.json();
      if (res.ok) {
        setBalance(json.balance);
      }
    } catch (err) {
      console.log("Error fetching balance:", err);
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };
  const onSubmit = async (data) => {
    setLoading(true);
    const res = await fetch("/api/payment_distributor", {
      method: "POST",
      body: JSON.stringify({
        distributor: distributor.value,
        date: data.date,
        amount: data.amount,
        type: "Paid",
        detail: data.detail,
      }),
    });

    const json = await res.json();
    if (res.ok) setMessage(json.message);
    setLoading(false);
    reset();
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
          <label className={css.label}>Distributor</label>
          <Select
            className={css.search}
            required
            placeholder="Select Distributor"
            options={distributors}
            value={distributor}
            onChange={(selectedOption) => {
              setDistributor(selectedOption);
              if (selectedOption) {
                fetchBalance(selectedOption.value);
              } else {
                setBalance(null);
              }
            }}
          />
          {distributor && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
              }}
            >
              <strong>Current Balance: </strong>
              {balanceLoading ? (
                <span>Loading...</span>
              ) : (
                <span style={{ color: balance > 0 ? "#e74c3c" : "#27ae60" }}>
                  ₹{getFormattedAmount(balance || 0)}
                </span>
              )}
            </div>
          )}

          {/* {errors.cement && (
            <p className={css.error}>Type of cement is required.</p>
          )} */}
        </div>
        <div className={css.container}>
          <label className={css.label}>Date</label>
          <input
            {...register("date", { required: true })}
            className={css.dateInput}
            placeholder="Enter Date"
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
          <label className={css.label}>Detail</label>
          <input
            {...register("detail", { required: true })}
            placeholder="Enter cash/cheque/online"
            type="text"
          />
          {errors.detail && <p className={css.error}>Detail is Required</p>}
        </div>

        <div className={css.container}>
          <button type="submit" className={css.submit} disabled={loading}>
            {loading ? <IconSpinner /> : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Payment;
