import { useState, useEffect } from "react";
import {
  FaRegClock,
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCalendar,
} from "react-icons/fa";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import SearchBar from "./Component/searchBar";
import EventCarousel from "./Component/eventCarousel";
import { ApprovedEvents } from "./data/mockdata";
import "./Component/background.css";
import { FaLocationPin } from "react-icons/fa6";
import RealtimeClock from "./Component/realtime";
import MainHeader from "./Component/MainHeader";
import { useAuth } from "./Auth/AuthContext";

const DashboardUser = () => {
  const { user } = useAuth();

  // State utama
  const [allEvents, setAllEvents] = useState([]);
  const [searchItem, setSearchItem] = useState("");
  const [topFilterCategory, setTopFilterCategory] = useState("");
  const [bottomFilterCategory, setBottomFilterCategory] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredNextEvents, setFilteredNextEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedEvents, setBookmarkedEvents] = useState(new Set());

  const toggleBookmark = (id) => {
    setBookmarkedEvents((prev) => {
      const newBookmarks = new Set(prev);
      newBookmarks.has(id) ? newBookmarks.delete(id) : newBookmarks.add(id);
      return newBookmarks;
    });
  };

  // Fetch data event dari API
  useEffect(() => {
    fetch("https://dummyjson.com/c/7e6f-abb1-4b8e-8687")
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setAllEvents(data.events);
          setFilteredNextEvents(data.events.slice(0, 4));
        }
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter list atas (This Week)
  useEffect(() => {
    const searchTermLower = searchItem.toLowerCase();
    const results = allEvents.filter((event) => {
      if (!searchTermLower) return true;
      if (topFilterCategory) {
        return (
          event[topFilterCategory]?.toString().toLowerCase() || ""
        ).includes(searchTermLower);
      } else {
        return `${event.info} ${event.location} ${event.speaker}`
          .toLowerCase()
          .includes(searchTermLower);
      }
    });
    setFilteredEvents(results);
  }, [searchItem, topFilterCategory, allEvents]);

  // Filter grid bawah (Next Events)
  useEffect(() => {
    const results = allEvents.filter((event) => {
      if (!bottomFilterCategory) return true;
      return true;
    });
    setFilteredNextEvents(results.slice(0, 4));
  }, [bottomFilterCategory, allEvents]);

  return (
    <div className="w-full relative overflow-x-hidden">
      <MainHeader pageTitle="Event Viewer" />

      <div className="p-5 space-y-2 bg-[#3C82CE]">
        <div className="flex items-center justify-between mb-3 px-20 text-white">
          <h1 className="text-2xl font-semibold">Current Events</h1>
          <RealtimeClock />
        </div>
        <div className="grid gap-2 w-full place-items-center">
          <EventCarousel carouselData={ApprovedEvents} />
        </div>
      </div>

      <div className="px-5 md:px-10 xl:px-20 pt-5 bgDash grid place-items-center">
        <div className="bg-white w-full h-full px-10 py-5 rounded-t-xl pb-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-semibold">This Week</h1>
            <div className="flex items-center gap-4">
              <SearchBar searchTerm={searchItem} onSearch={setSearchItem} />
              <select
                className="px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                value={topFilterCategory}
                onChange={(e) => setTopFilterCategory(e.target.value)}
              >
                <option value="">All Fields</option>
                <option value="info">Event Name</option>
                <option value="location">Location</option>
                <option value="speaker">Speaker</option>
              </select>
            </div>
          </div>

          <ul className="mt-4 space-y-4 divide-y-2 min-h-[200px]">
            {loading ? (
              <p>Loading...</p>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <li key={event.id} className={`p-4 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} flex items-center justify-between`}>
                  {/* List item event */}
                  <div>
                    <p className="font-semibold text-lg">{event.info}</p>
                    <div className="flex items-center text-sm text-gray-600 space-x-3 mt-1">
                      <span className="flex items-center">
                        <FaRegCalendarAlt className="mr-1" /> {event.date}
                      </span>
                      <span className="flex items-center">
                        <FaRegClock className="mr-1" /> {event.time}
                      </span>
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-red-500" />{" "}
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => toggleBookmark(event.id)}>
                    {bookmarkedEvents.has(event.id) ? (
                      <BsBookmarkFill className="text-blue-500" />
                    ) : (
                      <BsBookmark className="text-gray-500" />
                    )}
                  </button>
                </li>
              ))
            ) : (
              <p>No results found.</p>
            )}
          </ul>

          <h1 className="text-2xl font-semibold mt-10 mb-5">Next Events</h1>
          <div className="flex items-center justify-start gap-5 xl:gap-10 divide-x-4 h-fit max-h-full divide-gray-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* Grid bawah menggunakan filteredNextEvents */}
              {filteredNextEvents.map((event) => (
                <div
                  key={event.id + "-next"}
                  className="space-y-5 py-5 pl-5 pr-20 border-2 border-gray-500 rounded-lg h-full"
                >
                  <h1 className="text-xl font-semibold">{event.info}</h1>
                  <div>
                    <p className="space-x-2 flex items-center">
                      <FaClock className="text-[#EC6A37]"/>
                      <span>{event.time}</span>
                    </p>
                    <p className="space-x-2 flex items-center">
                      <FaCalendar className="text-[#3F88BC]"/>
                      <span>{event.date}</span>
                    </p>
                    <p className="space-x-2 flex items-center">
                      <FaLocationPin className="text-[#D9242A]"/>
                      <span>{event.location}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-full space-y-5 px-4">
              <h1 className="text-2xl font-semibold">Filters</h1>
              <select
                className="px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                value={bottomFilterCategory}
                onChange={(e) => setBottomFilterCategory(e.target.value)}
              >
                <option value="">All Fields</option>
                <option value="location">Location</option>
                {/* Tambahkan filter lain sesuai kebutuhan */}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-fit px-10 py-5 bg-[#F3F3F3] text-right">
        <p className="text-gray-600">Universitas Bina Nusantara Bekasi 2023</p>
      </div>
  {/* Footer */}
    </div>
  );
};

export default DashboardUser;
