import React, { useEffect, useMemo } from "react";
import debounce from "lodash.debounce";

export default function SearchBar({
  setPagination = null,
  setSearchTerm,
  adaptable = true,
  displaySearchBar,
  setDisplaySearchBar = () => {},
  placeholder = "Search for a fellow hiker"
}) {
  useEffect(() => {
    if (displaySearchBar) triggerSearch("");
  }, [displaySearchBar]);

  function triggerSearch(search) {
    if (setPagination) {
      setPagination((prev) => ({
        ...prev,
        page: 1,
      }));
    }

    setSearchTerm(search);
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
        placeholder={placeholder}
        onChange={(e) => {
          debouncedSearch(e.target.value);
        }}
        onBlur={() => {
          setDisplaySearchBar(false);
        }}
        autoFocus
      />
    </>
  );
}
