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

async function setNewElements(fetchURL, dataKey, setElements, setPagination = null, reset = false) {
  try {
    if(setPagination) setPagination((prev) => ({ ...prev, loading: true }));

    const res = await fetch(fetchURL, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(`The requested data could not be retrieved.`);
    }

    const data = await res.json();

    reset ? setElements(data[dataKey]) : setElements((prevElements) => [...prevElements, ...data[dataKey]])

    if(setPagination) updatePagination(setPagination, data.metadata.pages);

    return data;
  } catch (error) {
    console.error(error.message);
  } finally {
    if(setPagination) setPagination((prev) => ({ ...prev, loading: false }));
  }
}

function updateScrollBottom(setScrollBottom, element) {
  setScrollBottom(element.scrollHeight - element.scrollTop - element.clientHeight);
}

export { setNewElements, updateListEndMessage, updatePagination, updateScrollBottom };
