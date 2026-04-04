"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import css from "./Customer.module.css";
import Link from "next/link";
import DataTable from "./DataTable";
import IconSpinner from "../IconSpinner/IconSpinner";
import { generatePdf } from "./GenerateMonthPdf";
import moment from "moment";
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    border: state.isFocused ? "2px solid #0ea5e9" : "1.5px solid #cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(14,165,233,0.15)" : "none",
    minHeight: "44px",
    fontSize: "1rem",
    background: "#ffffff",
    "&:hover": { borderColor: "#94a3b8" },
  }),
  input: (base) => ({ ...base, fontSize: "1rem" }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
  singleValue: (base) => ({ ...base, color: "#0f172a", fontWeight: 600 }),
  multiValue: (base) => ({
    ...base,
    background: "#e0f2fe",
    borderRadius: "0.4rem",
  }),
  multiValueLabel: (base) => ({ ...base, color: "#0369a1", fontWeight: 600 }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#0369a1",
    ":hover": { background: "#bae6fd", color: "#0c4a6e" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? "#0ea5e9"
      : state.isFocused
        ? "#f0f9ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#0f172a",
    fontWeight: state.isSelected ? 700 : 400,
    cursor: "pointer",
  }),
};

const ViewCustomer = () => {
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [totalBags, setTotalBags] = useState(0);
  const [distributorsWithOutData, setDistributorsWithOutData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState([]);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, index) => {
    const value = String(currentYear - index);
    return { label: value, value };
  });
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
          balance: distributor.lastRecord?.balance || 0,
        }));
        setDistributorsWithOutData(options);
      }
      setLoading(false);
    })();
  }, []);

  const handleViewData = async () => {
    if (selectedDistributor) {
      (async () => {
        setLoading(true);
        const years = JSON.stringify(year);
        const res = await fetch(
          `/api/record?id=${selectedDistributor.value}&year=${years}`,
        );
        const json = await res.json();
        setDistributors(json.data);
        setTotalBags(json.bags);
        setLoading(false);
      })();
    }
  };
  const handleDownloadPdf = async () => {
    const pdfBytes = await generatePdf(distributorsWithOutData);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Monthly_Report_${moment().format("DD_MM_YYYY")}.pdf`,
    );
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };
  return (
    <div className={css.root}>
      <h1 className={css.heading}>View Customer</h1>
      <div className={css.viewContainer}>
        <Select
          className={css.search}
          instanceId="customer-search"
          inputId="customer-search-input"
          styles={selectStyles}
          options={distributorsWithOutData}
          required
          placeholder="Search Customer by Name or Address"
          value={selectedDistributor}
          onChange={(selectedOption) => {
            setSelectedDistributor(selectedOption);
            setDistributors([]);
          }}
        />
        <CreatableSelect
          instanceId="customer-year-filter"
          inputId="customer-year-filter-input"
          styles={selectStyles}
          isMulti
          options={yearOptions}
          placeholder="Type or select year(s)..."
          value={year}
          onChange={(selectedOption) => setYear(selectedOption || [])}
          formatCreateLabel={(inputValue) => `Add year "${inputValue}"`}
          noOptionsMessage={() => "Type a year and press Enter"}
        />
        <div className={css.buttonContainer}>
          <button
            className={css.button}
            type="button"
            onClick={() => handleViewData()}
            disabled={!(year.length && selectedDistributor)}
          >
            View
          </button>
          <button
            className={css.monthButton}
            type="button"
            onClick={() => handleDownloadPdf()}
            disabled={!distributorsWithOutData?.length}
          >
            ⬇ Month Report
          </button>
        </div>
      </div>
      <br />
      {loading ? <IconSpinner /> : null}
      {distributors?.length ? (
        <DataTable
          key="customer"
          data={distributors}
          totalBags={totalBags}
          year={year}
          customer={true}
          distributor={selectedDistributor}
        />
      ) : null}
    </div>
  );
};

export default ViewCustomer;
