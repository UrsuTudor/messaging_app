import debounce from "lodash.debounce";

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

function handleResize(setDisplaySearchBar) {
  const debouncedResize = debounce(() => {
    setDisplaySearchBar(window.innerWidth > 1400);
  }, 100);

  window.addEventListener("resize", debouncedResize);

  return () => window.removeEventListener("resize", debouncedResize);
}

async function setNewElements(fetchURL, dataKey, setElements, setPagination = null, reset = false) {
  try {
    if (setPagination) setPagination((prev) => ({ ...prev, loading: true }));

    const res = await fetch(fetchURL, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(`The requested data could not be retrieved.`);
    }

    const data = await res.json();

    reset ? setElements(data[dataKey]) : setElements((prevElements) => [...prevElements, ...data[dataKey]]);

    if (setPagination) updatePagination(setPagination, data.metadata.pages);

    return data;
  } catch (error) {
    console.error(error.message);
  } finally {
    if (setPagination) setPagination((prev) => ({ ...prev, loading: false }));
  }
}

function updateScrollBottom(setScrollBottom, element) {
  setScrollBottom(element.scrollHeight - element.scrollTop - element.clientHeight);
}

async function sendOrganiserInvites(e, organisers, eventId, csrf) {
  e.preventDefault()
  
  let organiserUuids = organisers.map((org) => org[0].uuid);

  try {
    const res = await fetch(`/api/v1/events/participate`, {
      method: "POST",
      headers: {
        "X-CSRF-Token": csrf,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_membership: { event_id: eventId, role: "organiser", user_uuids: organiserUuids },
      }),
    });

    if (!res.ok) {
      throw new Error("We couldn't send invites to other organisers.");
    }
  } catch (error) {
    console.error(error.message);
  }
}

function updateEventDetails(e, userList, setter, loggedUser) {
  e.preventDefault();
  e.stopPropagation();
  setter((prev) => ({ ...prev, organisers: [loggedUser, ...userList] }));
}

export {
  setNewElements,
  updateListEndMessage,
  updatePagination,
  updateScrollBottom,
  handleResize,
  sendOrganiserInvites,
  updateEventDetails,
};
