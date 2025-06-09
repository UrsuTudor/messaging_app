function updateListEndMessage(setPagination) {
  setPagination((prev) => ({
    ...prev,
    endMessage: "You have reached the end!",
  }));
  return;
}

function updatePagination(setPagination, totalPages) {
  setPagination((prev) => ({
    ...prev,
    page: prev.page + 1,
    pages: totalPages,
  }));
}

async function setNewElements(fetchURL, dataKey, setElements, setPagination, page) {
  try {
    setPagination((prev) => ({ ...prev, loading: true }));

    const res = await fetch(fetchURL, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(`The requested data could not be retrieved.`);
    }

    const data = await res.json();
    // userList/chatList would fire setNewElements twice on a remount, causing duplicates in the array; this if check
    // prevents duplicates from appearing on remount if the two calls happen so fast that pagination.page can't set its
    // new value
    setElements((prevElements) => {
      if (prevElements.length == data[dataKey].length && page == 1) {
        return [...data[dataKey]];
      } else {
        return [...prevElements, ...data[dataKey]];
      }
    });

    updatePagination(setPagination, data.metadata.pages);

    return data;
  } catch (error) {
    console.error(error.message);
  } finally {
    setPagination((prev) => ({ ...prev, loading: false }));
  }
}

function updateScrollBottom(setScrollBottom, element) {
  setScrollBottom(element.scrollHeight - element.scrollTop - element.clientHeight);
}

export { setNewElements, updateListEndMessage, updatePagination, updateScrollBottom };
