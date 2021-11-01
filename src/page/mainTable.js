import React, { useState, useEffect } from "react";
import { Rest } from "../rest";

function MainTable() {
  const [profileInfo, setProfileinfo] = useState("");
  const [dealList, setDealList] = useState([]);

  // Rest.callMethod("profile").then((res) => {
  //   setProfileinfo(res.items[0].NAME);
  // });

  // Rest.callMethod("crm.deal.list").then((res) => {
  //   setDealList(res.items);
  // });

  useEffect(() => {
    if (profileInfo === "") {
      Rest.callMethod("profile")
        .then((res) => {
          setProfileinfo(res.items[0].NAME);
        })
        .then(console.warn(profileInfo));
    }

    if (dealList.length === 0) {
      Rest.callMethod("crm.deal.list")
        .then((res) => {
          console.warn("response=" + res);
          setDealList(res.items);
        })
        .then(console.warn("dealList=" + dealList))
        .then(console.warn("dealList[0]=" + dealList[0]));
    }
  });

  return (
    <div>
      <div>Main Page by Mishka</div>
      <div>profileInfo - {profileInfo}</div>
      <div>deals: {dealList[0]?.ID + "" + dealList[0]?.TITLE}</div>
    </div>
  );
}

export default MainTable;
