import React from "react";
import { useState } from "react";
import { Mycontext } from "./Mycontext";
import { useEffect } from "react";
import axios from "axios";

function ContextProvider({ children }) {
  // events registred count
  let [eventCount, seteventCount] = useState(0);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events/");
      seteventCount(res.data.data[0].registeredCount);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);

  let data = { eventCount ,fetchEvents};
  return <Mycontext.Provider value={data}>{children}</Mycontext.Provider>;
}

export default ContextProvider;
