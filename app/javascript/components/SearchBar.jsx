import React, { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { setNewElements } from "../assets/helpers";

export default function SearchBar({ route, dataKey, setPagination, listSetter }) {
  const [displaySearchBar, setDisplaySearchBar] = useState(window.innerWidth > 1400)

  function searchUsers(search) {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    setNewElements(`${route}&search=${search}`, dataKey, listSetter, setPagination, true);
  }

  const debouncedSearch = useMemo(() => debounce((search) => searchUsers(search), 300));

  return window.innerWidth < 1400 && !displaySearchBar ? (
    <img
      src="search.svg"
      className="chatIconContainer"
      id="searchIcon"
      alt="An icon of a magnifier marking a button that lets you search for a user or chat."
      onClick={() => { setDisplaySearchBar(true) }}
    />
  ) : (
    <input
      className="searchBar"
      type="text"
      placeholder="Search for a fellow hiker"
      onChange={(e) => {
        debouncedSearch(e.target.value);
      }}
      onBlur={() => { setDisplaySearchBar(false)}}
      autoFocus
    />
  );
}
