"use client";
import React, { useEffect, useState } from "react";
import css from "./Distributor.module.css";
import IconSpinner from "../IconSpinner/IconSpinner";
const Delete = (props) => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [message, setMessage] = useState("");
  const [distributorToDelete, setDistributorToDelete] = useState(null);
  const [distributorToEdit, setDistributorToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    address: "",
  });
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
  }, [deleted]);

  const handleDeleteDistributor = async () => {
    if (!distributorToDelete) return;

    setError("");
    setMessage("");
    setLoading(true);
    const res = await fetch(
      `/api/distributor?id=${distributorToDelete.value}`,
      {
        method: "DELETE",
      },
    );
    setLoading(false);
    const json = await res.json();

    if (!res.ok) setError(json.message);
    else {
      setDeleted(!deleted);
      setMessage(json.message);
      setTimeout(() => setMessage(null), 5000);
    }

    setDistributorToDelete(null);
  };

  const handleEditDistributor = (distributor) => {
    setDistributorToEdit(distributor);
    setEditFormData({
      firstName: distributor.data.firstName,
      lastName: distributor.data.lastName,
      mobileNumber: distributor.data.phone,
      address: distributor.data.address,
    });
  };

  const handleUpdateDistributor = async () => {
    if (!distributorToEdit) return;

    setError("");
    setMessage("");
    setLoading(true);
    const res = await fetch(`/api/distributor?id=${distributorToEdit.value}`, {
      method: "PUT",
      body: JSON.stringify(editFormData),
    });
    setLoading(false);
    const json = await res.json();

    if (!res.ok) {
      setError(json.message);
    } else {
      setDeleted(!deleted);
      setMessage(json.message);
      setTimeout(() => setMessage(null), 5000);
    }

    setDistributorToEdit(null);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      [field]: value,
    });
  };
  return (
    <div className={css.deleteContainer}>
      <div className={css.distributorInfo}>
        <div className={css.distributorName}>Distributors</div>
        {/* <div className={css.number}>{distributor?.data?.phone}</div> */}
      </div>
      {loading ? <IconSpinner /> : null}
      {message && <p className={css.message}>{message}</p>}
      {error && <p className={css.error}>{error}</p>}
      <br />
      <table className={css.table}>
        <thead className={css.tableHeading}>
          <tr className={css.tableRow}>
            <th>S No.</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Mobile</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {distributors?.map((distributor, index) => (
            <tr key={index} className={css.tableRow}>
              <td>{index + 1}</td>
              <td>{distributor.data.firstName}</td>
              <td>{distributor.data.lastName}</td>
              <td>{distributor.data.phone}</td>
              <td>{distributor.data.address}</td>
              <td>
                <button
                  type="button"
                  className={css.editButton}
                  onClick={() => handleEditDistributor(distributor)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={css.deleteButton}
                  onClick={() => setDistributorToDelete(distributor)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {distributorToDelete ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Confirm Delete</h3>
            <p className={css.modalText}>
              Delete {distributorToDelete.data.firstName}{" "}
              {distributorToDelete.data.lastName}? This action cannot be undone.
            </p>
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                onClick={() => setDistributorToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={css.modalDelete}
                onClick={handleDeleteDistributor}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {distributorToEdit ? (
        <div className={css.modalOverlay}>
          <div className={css.modalCard}>
            <h3 className={css.modalTitle}>Edit Distributor</h3>
            <div className={css.editFormContainer}>
              <div className={css.editFormField}>
                <label className={css.modalLabel}>First Name</label>
                <input
                  type="text"
                  className={css.modalInput}
                  value={editFormData.firstName}
                  onChange={(e) =>
                    handleEditFormChange("firstName", e.target.value)
                  }
                  placeholder="First Name"
                />
              </div>
              <div className={css.editFormField}>
                <label className={css.modalLabel}>Last Name</label>
                <input
                  type="text"
                  className={css.modalInput}
                  value={editFormData.lastName}
                  onChange={(e) =>
                    handleEditFormChange("lastName", e.target.value)
                  }
                  placeholder="Last Name"
                />
              </div>
              <div className={css.editFormField}>
                <label className={css.modalLabel}>Mobile Number</label>
                <input
                  type="text"
                  className={css.modalInput}
                  value={editFormData.mobileNumber}
                  onChange={(e) =>
                    handleEditFormChange("mobileNumber", e.target.value)
                  }
                  placeholder="Mobile Number"
                />
              </div>
              <div className={css.editFormField}>
                <label className={css.modalLabel}>Address</label>
                <input
                  type="text"
                  className={css.modalInput}
                  value={editFormData.address}
                  onChange={(e) =>
                    handleEditFormChange("address", e.target.value)
                  }
                  placeholder="Address"
                />
              </div>
            </div>
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                onClick={() => setDistributorToEdit(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={css.modalShare}
                onClick={handleUpdateDistributor}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Delete;
