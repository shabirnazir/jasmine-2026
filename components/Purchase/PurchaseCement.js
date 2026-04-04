"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import css from "./Purchase.module.css";
import IconSpinner from "../IconSpinner/IconSpinner";
const PurchaseCement = (props) => {
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
      value: "cadbury_chocolate",
      label: "Cadbury Chocolate",
    },
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [selectedCement, setSelectedCement] = useState(null);
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
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/cement", {
        method: "POST",
        body: JSON.stringify({
          type: selectedCement.value,
          distributor: selectedDistributor.value,
          price: data.price,
          fair: data.fair,
          chalan: data.chalan,
          truckNumber: data.truckNumber,
          date: data.date,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(json.message);
        reset();
        setSelectedDistributor(null);
        setSelectedCement(null);
      } else {
        setError(json.message);
      }
    } catch (error) {
      setError("An error occurred while adding the distributor.");
      console.log(error);
    }
    setLoading(false);
  };
  return (
    <div className={css.root}>
      <form onSubmit={handleSubmit(onSubmit)} className={css.form}>
        <h1 className={css.heading}>Purchase</h1>
        {message && <p className={css.message}>{message}</p>}
        {error && <p className={css.error}>{error}</p>}
        <div className={css.formGrid}>
          <div className={css.container}>
            <label className={css.label}>Type of Product</label>
            <Select
              className={css.select}
              name="cement"
              id="cement"
              required
              placeholder="Select product"
              options={options}
              value={selectedCement}
              onChange={(selectedOption) => {
                setSelectedCement(selectedOption);
              }}
            />
          </div>
          <div className={css.container}>
            <label className={css.label}>Distributor</label>
            <Select
              className={css.select}
              options={distributors}
              placeholder="Select distributor"
              value={selectedDistributor}
              onChange={(selectedOption) => {
                setSelectedDistributor(selectedOption);
              }}
              required
            />

            {errors.distributor && (
              <p className={css.error}>Distributor name is required.</p>
            )}
          </div>
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
          {/* <div className={css.container}>
          <label className={css.label}>Fair</label>
          <input
            {...register("fair", { required: true })}
            placeholder="Enter fair"
            type="number"
          />

          {errors.fair && (
            <p className={css.error}>
              Fair is required and should be a number.
            </p>
          )}
        </div> */}
          <div className={css.container}>
            <label className={css.label}>Chalan Number</label>
            <input
              {...register("chalan", { required: true })}
              placeholder="Enter Chalan Number"
            />
            {errors.chalan && (
              <p className={css.error}>Chalan Number is required</p>
            )}
          </div>
          {/* <div className={css.container}>
          <label className={css.label}>Truck Number</label>
          <input
            {...register("truckNumber", { required: true })}
            placeholder="Enter Truck Number"
          />
          {errors.truckNumber && (
            <p className={css.error}>Truck Number is required</p>
          )}
        </div> */}
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
            <button type="submit" className={css.submit} disabled={loading}>
              {loading ? <IconSpinner /> : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseCement;
