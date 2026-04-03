import React from "react";
import css from "./Print.module.css";

export const ComponentToPrint = React.forwardRef(
  function ComponentToPrint(props, ref) {
    const { data, distributor } = props;

    return (
      <div ref={ref} className={css.container}>
        <h1 className={css.heading}>Jasmine Enterprises</h1>
        <div className={css.subHeading}>Muslim Abad B k pora (6006034726)</div>
        <div className={css.details}>
          <div>
            <div className={css.sub}>
              <div className={css.label}>Name</div>
              <div className={css.value}>
                {distributor?.data?.firstName +
                  " " +
                  distributor?.data?.lastName}
              </div>
            </div>
            <div className={css.sub}>
              <div className={css.label}>Address</div>
              <div className={css.value}>
                {distributor?.data?.address || "-"}
              </div>
            </div>
          </div>
          <div>
            <div className={css.sub}>
              <div className={css.label}>Phone</div>
              <div className={css.value}>{distributor?.data?.phone || "-"}</div>
            </div>
            <div className={css.sub}>
              <div className={css.label}>Date</div>
              <div className={css.value}>
                {new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
        {data}
      </div>
    );
  },
);
