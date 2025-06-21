const API_BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2109-CPU-RM-WEB-PT";
const EVENTS_URL = `${API_BASE}/${COHORT}/events`;
const RSVPS_URL = `${API_BASE}/${COHORT}/rsvps`;
const GUESTS_URL = `${API_BASE}/${COHORT}/guests`;

// === STATE ===
let state = {
  parties: [],
  selectedParty: null,
  guests: [],
};

// === MAIN RENDER FUNCTION ===
async function render() {
  document.body.innerHTML = ""; // Clear everything

  const title = document.createElement("h1");
  title.innerText = "Party Planner";
  document.body.appendChild(title);

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.justifyContent = "space-between";

  container.appendChild(PartyList());
  container.appendChild(PartyDetails());

  document.body.appendChild(container);
}

// === COMPONENT: Party List ===
function PartyList() {
  const wrapper = document.createElement("div");

  const header = document.createElement("h2");
  header.innerText = "Upcoming Parties";

  const ul = document.createElement("ul");

  state.parties.forEach((party) => {
    const li = document.createElement("li");
    li.innerText = party.name;
    li.style.cursor = "pointer";
    li.style.padding = "5px";
    li.style.border = "1px solid #ccc";
    li.style.marginBottom = "4px";
    if (state.selectedParty?.id === party.id) {
      li.style.fontStyle = "italic";
      li.style.fontWeight = "bold";
    }
    li.addEventListener("click", async () => {
      await fetchSingleParty(party.id);
      await fetchGuests();
      render();
    });
    ul.appendChild(li);
  });

  wrapper.appendChild(header);
  wrapper.appendChild(ul);
  return wrapper;
}

// === COMPONENT: Party Details ===
function PartyDetails() {
  const wrapper = document.createElement("div");

  const header = document.createElement("h2");
  header.innerText = "Party Details";
  wrapper.appendChild(header);

  if (!state.selectedParty) {
    const message = document.createElement("p");
    message.innerText = "Select a party to view details.";
    wrapper.appendChild(message);
    return wrapper;
  }

  const party = state.selectedParty;

  const title = document.createElement("h3");
  title.innerHTML = `<strong>${party.name} #${party.id}</strong>`;

  const date = document.createElement("p");
  date.innerText = party.date;

  const location = document.createElement("p");
  location.innerHTML = `<em>${party.location}</em>`;

  const description = document.createElement("p");
  description.innerText = party.description;

  const guestHeader = document.createElement("h4");
  guestHeader.innerText = "Guest List";

  const guestList = document.createElement("ul");
  const guestIds = party.rsvps?.map((r) => r.guestId) || [];
  state.guests
    .filter((g) => guestIds.includes(g.id))
    .forEach((guest) => {
      const li = document.createElement("li");
      li.innerText = guest.name;
      guestList.appendChild(li);
    });

  wrapper.append(title, date, location, description, guestHeader, guestList);
  return wrapper;
}

// === FETCH FUNCTIONS ===
async function fetchParties() {
  try {
    const res = await fetch(EVENTS_URL);
    const data = await res.json();
    state.parties = data.data;
  } catch (err) {
    console.error("Error fetching parties", err);
  }
}

async function fetchSingleParty(id) {
  try {
    const res = await fetch(`${EVENTS_URL}/${id}`);
    const data = await res.json();
    state.selectedParty = data.data;
    await fetchRsvps(state.selectedParty);
  } catch (err) {
    console.error("Error fetching party", err);
  }
}

async function fetchRsvps(party) {
  try {
    const res = await fetch(RSVPS_URL);
    const data = await res.json();
    const rsvps = data.data.filter((r) => r.eventId === party.id);
    party.rsvps = rsvps;
  } catch (err) {
    console.error("Error fetching RSVPs", err);
  }
}

async function fetchGuests() {
  try {
    const res = await fetch(GUESTS_URL);
    const data = await res.json();
    state.guests = data.data;
  } catch (err) {
    console.error("Error fetching guests", err);
  }
}

// === INITIALIZE ===
async function init() {
  await fetchParties();
  await render();
}

init();
