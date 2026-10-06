import React, { useState, useEffect } from "react";
import { Mycontext } from "./Mycontext";
import axios from "axios";

function ContextProvider({ children }) {
  const [eventsData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL =
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_LOCAL_BASE_URL
  ;

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/events/");
      console.log("eventdata", res.data.data);
      // ✅ store full events array
      setEventData(res.data.data);

      console.log("eventdata", res.data.data);

    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Mycontext.Provider value={{ eventsData, fetchEvents, loading }}>
      {children}
    </Mycontext.Provider>
  );
}

export default ContextProvider;