import React, { useMemo } from "react";
import debounce from "lodash.debounce";
import { setNewElements } from "../assets/helpers";

export default function SearchBar({route, dataKey, setPagination, listSetter}) {
  function searchUsers(search) {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    setNewElements(
      `${route}&search=${search}`,
      dataKey,
      listSetter,
      setPagination,
      true
    );
  }

  const debouncedSearch = useMemo(() => debounce((search) => searchUsers(search), 300));

  return (
    <input
      className="searchBar"
      type="text"
      placeholder="Search for a friend"
      onChange={(e) => {
        debouncedSearch(e.target.value);
      }}
    />
  );
}
