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

function handleResize(setDisplaySearchBar, width) {
  const debouncedResize = debounce(() => {
    setDisplaySearchBar(window.innerWidth > width);
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

async function createChat(e, userList, csrfToken, setMainDisplay) {
    e.preventDefault();
    let receiver_uuids = userList.map((user) => user[0].uuid);

    try {
      let res = await fetch(`/api/v1//chats/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ chat: { receiver_uuids: receiver_uuids } }),
      });

      if (!res.ok) {
        console.log("The chat could not be created.");
      }

      let data = await res.json();

      if (res.conflict) {
        res = await fetch(`/api/v1/chats/${data.chat_id}`, {
          method: "GET"
        })

        data = await res.json()
      }

      setMainDisplay((prev) => [
        ...prev,
        {
          type: "chat",
          receivers: userList.map((user) => {
            return {
              avatar: user[0].avatar,
              name: user[0].name,
              uuid: user[0].uuid,
              description: user[0].description,
              chat_id: data.chat_id,
            };
          }),
        },
      ]);
    } catch (error) {
      console.error(error.message);
    }
  }

export {
  setNewElements,
  updateListEndMessage,
  updatePagination,
  updateScrollBottom,
  handleResize,
  sendOrganiserInvites,
  updateEventDetails,
  createChat
};
