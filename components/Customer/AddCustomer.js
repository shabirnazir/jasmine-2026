"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import css from "./Customer.module.css";

const AddCustomer = (props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await fetch("/api/customer", {
      method: "POST",
      body: JSON.stringify(data),
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
        <h1 className={css.heading}>Add Customer</h1>
        {message && <p className={css.message}>{message}</p>}
        {error && <p className={css.error}>{error}</p>}

        <div className={css.formGrid}>
          <div className={css.container}>
            <label className={css.label}>First Name</label>
            <input
              {...register("firstName", { required: true })}
              placeholder="John"
            />
            {errors.firstName && (
              <p className={css.error}>First name is required.</p>
            )}
          </div>

          <div className={css.container}>
            <label className={css.label}>Last Name</label>
            <input
              {...register("lastName", { required: true })}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className={css.error}>Last name is required.</p>
            )}
          </div>

          <div className={css.container}>
            <label className={css.label}>Mobile Number</label>
            <input
              {...register("mobileNumber", { required: true })}
              placeholder="Enter Mobile Number"
            />
            {errors.mobileNumber && (
              <p className={css.error}>Mobile Number is required</p>
            )}
          </div>

          <div className={`${css.container} ${css.fieldFull}`}>
            <label className={css.label}>Address</label>
            <input
              {...register("address", { required: true })}
              placeholder="Enter Address"
            />
            {errors.address && <p className={css.error}>Address is required</p>}
          </div>

          <div className={`${css.container} ${css.actions}`}>
            <button type="submit" className={css.submit} disabled={loading}>
              {loading ? "Adding customer..." : "Add Customer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;
