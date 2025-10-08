import React, { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { setNewElements } from "../assets/helpers";

export default function SearchBar({ route, dataKey, setPagination, listSetter, setSearchTerm, adaptable = true }) {
  const [displaySearchBar, setDisplaySearchBar] = useState(window.innerWidth > 1400);

  function triggerSearch(search) {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    setSearchTerm(search)
  }

  const debouncedSearch = useMemo(() => debounce((search) => triggerSearch(search), 300));

  return window.innerWidth < 1400 && !displaySearchBar && adaptable ? (
    <img
      src="search.svg"
      className="chatIconContainer"
      id="searchIcon"
      alt="search"
      onClick={() => {
        setDisplaySearchBar(true);
      }}
    />
  ) : (
    <>
      <label htmlFor="searchBar" className="hidden">
        Search for a fellow hiker
      </label>
      <input
        id="searchBar"
        className="searchBar"
        type="text"
        placeholder="Search for a fellow hiker"
        onChange={(e) => {
          debouncedSearch(e.target.value);
        }}
        onBlur={() => {
          setDisplaySearchBar(false);
          triggerSearch("")
        }}
        autoFocus
      />
    </>
  );
}


// problem: when a search is made, if the search would return more than 20 elements, only the first 20 will be filtered
// cause: the lists don't know anything about the search term, so as the user scrolls down and a new list is requested, 
// the new list isn't filtered

// solution: you are already resetting pagination when a search is made, which is good
// you need to make the search term a state in userList and chatList; they need to be separate states that get sent with
// their respective routes on scroll
