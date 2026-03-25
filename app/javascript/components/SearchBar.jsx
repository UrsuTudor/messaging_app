import React, { useEffect, useMemo } from "react"
import debounce from "lodash.debounce"

export default function SearchBar({
  setPagination = null,
  setSearchTerm,
  adaptable = true,
  displaySearchBar,
  setDisplaySearchBar = () => {},
  placeholder = "Search for a fellow hiker",
}) {
  useEffect(() => {
    if (displaySearchBar) triggerSearch("")
  }, [displaySearchBar])

  function triggerSearch(search) {
    if (setPagination) {
      setPagination((prev) => ({
        ...prev,
        page: 1,
      }))
    }

    setSearchTerm(search)
  }

  const debouncedSearch = useMemo(() =>
    debounce((search) => triggerSearch(search), 300),
  )

  return window.innerWidth < 1400 && !displaySearchBar && adaptable ? (
    <img
      src="search.svg"
      className="chatIconContainer"
      id="searchIcon"
      alt="search"
      onClick={() => {
        setDisplaySearchBar(true)
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
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          debouncedSearch(e.target.value)
        }}
        onBlur={() => {
          // on mobile layouts, there is a small race condition between a user being clicked
          // and the searchbar with its list being hidden; without the timeout, the blur happens
          // before the click can trigger the profile display
          setTimeout(() => setDisplaySearchBar(false), 100)
        }}
        autoFocus
      />
    </>
  )
}
