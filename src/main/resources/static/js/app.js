const API_BASE_URL = "/school";

let schools = [];
let deleteCandidate = null;
let activityLog = [];

let sortState = {
    key: "id",
    direction: "asc"
};

const elements = {};


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindEvents();
    startClock();
    getAllSchools();
});


/* =========================================================
   CACHE HTML ELEMENTS
   ========================================================= */

function cacheElements() {

    // Sidebar
    elements.sidebar = document.getElementById("sidebar");
    elements.menuToggle = document.getElementById("menu-toggle");
    elements.refreshButton = document.getElementById("refresh-button");
    elements.openAddButton = document.getElementById("open-add-button");
    elements.navLinks = document.querySelectorAll(".nav-link");

    // Dashboard
    elements.totalSchools = document.getElementById("total-schools");
    elements.activeSchools = document.getElementById("active-schools");
    elements.inactiveSchools = document.getElementById("inactive-schools");
    elements.recentlyUpdated = document.getElementById("recently-updated");

    // Add School
    elements.addSchoolForm = document.getElementById("add-school-form");
    elements.schoolName = document.getElementById("school-name");
    elements.schoolLocation = document.getElementById("school-location");
    elements.schoolNameError = document.getElementById("school-name-error");
    elements.schoolLocationError = document.getElementById("school-location-error");
    elements.addSchoolButton = document.getElementById("add-school-button");

    // Search School
    elements.searchSchoolForm = document.getElementById("search-school-form");
    elements.searchSchoolId = document.getElementById("search-school-id");
    elements.searchSchoolIdError = document.getElementById("search-school-id-error");
    elements.searchSchoolButton = document.getElementById("search-school-button");
    elements.searchResult = document.getElementById("search-result");

    // School Table
    elements.tableSearch = document.getElementById("table-search");
    elements.statusFilter = document.getElementById("status-filter");
    elements.tableStatus = document.getElementById("table-status");
    elements.schoolsTableBody = document.getElementById("schools-table-body");
    elements.emptyState = document.getElementById("empty-state");
    elements.emptyAddButton = document.getElementById("empty-add-button");
    elements.sortButtons = document.querySelectorAll(".sort-button");

    // Edit Modal
    elements.editModal = document.getElementById("edit-modal");
    elements.editSchoolForm = document.getElementById("edit-school-form");
    elements.editSchoolId = document.getElementById("edit-school-id");
    elements.editSchoolName = document.getElementById("edit-school-name");
    elements.editSchoolLocation = document.getElementById("edit-school-location");
    elements.editSchoolNameError = document.getElementById("edit-school-name-error");
    elements.editSchoolLocationError = document.getElementById("edit-school-location-error");
    elements.saveEditButton = document.getElementById("save-edit-button");
    elements.closeEditModalButton = document.getElementById("close-edit-modal");
    elements.cancelEditButton = document.getElementById("cancel-edit-button");

    // Delete Modal
    elements.deleteModal = document.getElementById("delete-modal");
    elements.deleteMessage = document.getElementById("delete-message");
    elements.confirmDeleteButton = document.getElementById("confirm-delete-button");
    elements.closeDeleteModalButton = document.getElementById("close-delete-modal");
    elements.cancelDeleteButton = document.getElementById("cancel-delete-button");

    // Cyberpunk UI
    elements.toastContainer = document.getElementById("toast-container");
    elements.activityList = document.getElementById("activity-list");
    elements.liveTime = document.getElementById("live-time");
    elements.liveDate = document.getElementById("live-date");
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function bindEvents() {

    // Forms
    elements.addSchoolForm.addEventListener("submit", addSchool);
    elements.searchSchoolForm.addEventListener("submit", getSchoolById);
    elements.editSchoolForm.addEventListener("submit", updateSchool);

    // Refresh
    elements.refreshButton.addEventListener(
        "click",
        () => getAllSchools(true)
    );

    // Table Search
    elements.tableSearch.addEventListener(
        "input",
        renderSchools
    );

    // Status Filter
    elements.statusFilter.addEventListener(
        "change",
        renderSchools
    );

    // Sorting
    elements.sortButtons.forEach(button => {

        button.addEventListener("click", () => {
            changeSort(button.dataset.sort);
        });

    });

    // Navigation
    elements.navLinks.forEach(button => {

        button.addEventListener("click", () => {
            navigateToSection(button);
        });

    });

    // Sidebar
    elements.menuToggle.addEventListener(
        "click",
        toggleSidebar
    );

    // Add School Buttons
    elements.openAddButton.addEventListener(
        "click",
        focusAddSection
    );

    elements.emptyAddButton.addEventListener(
        "click",
        focusAddSection
    );

    // Edit Modal
    elements.closeEditModalButton.addEventListener(
        "click",
        closeEditModal
    );

    elements.cancelEditButton.addEventListener(
        "click",
        closeEditModal
    );

    // Delete Modal
    elements.confirmDeleteButton.addEventListener(
        "click",
        deleteSchool
    );

    elements.closeDeleteModalButton.addEventListener(
        "click",
        closeDeleteModal
    );

    elements.cancelDeleteButton.addEventListener(
        "click",
        closeDeleteModal
    );

    // Close edit modal when clicking outside
    elements.editModal.addEventListener("click", event => {

        if (event.target === elements.editModal) {
            closeEditModal();
        }

    });

    // Close delete modal when clicking outside
    elements.deleteModal.addEventListener("click", event => {

        if (event.target === elements.deleteModal) {
            closeDeleteModal();
        }

    });

    // Escape key
    document.addEventListener(
        "keydown",
        handleEscapeKey
    );
}


/* =========================================================
   GET ALL SCHOOLS
   ========================================================= */

async function getAllSchools(showSuccessMessage = false) {

    setButtonLoading(
        elements.refreshButton,
        true,
        "REFRESHING..."
    );

    setTableLoading(true);

    try {

        const response = await fetch(
            `${API_BASE_URL}/getAll`
        );

        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }

        const data = await parseJsonResponse(response);

        if (!Array.isArray(data)) {

            throw new Error(
                "Expected an array from /getAll."
            );

        }

        schools = data;

        updateDashboardStatistics();

        renderSchools();

        if (showSuccessMessage) {

            addActivity(
                "Registry refreshed",
                "search"
            );

            showNotification(
                "School registry refreshed.",
                "success"
            );

        }

    } catch (error) {

        console.error(
            "getAllSchools failed:",
            error
        );

        schools = [];

        updateDashboardStatistics();

        renderSchools();

        elements.tableStatus.textContent =
            "BACKEND OFFLINE OR UNREACHABLE";

        showNotification(
            "Unable to communicate with the Spring Boot server.",
            "error"
        );

    } finally {

        setButtonLoading(
            elements.refreshButton,
            false,
            "↻ REFRESH"
        );

    }
}


/* =========================================================
   ADD SCHOOL
   ========================================================= */

async function addSchool(event) {

    event.preventDefault();

    clearAddFormErrors();

    const name =
        elements.schoolName.value.trim();

    const location =
        elements.schoolLocation.value.trim();

    if (
        !validateSchoolFields(
            name,
            location,
            elements.schoolNameError,
            elements.schoolLocationError
        )
    ) {

        showNotification(
            "Check the highlighted fields.",
            "warning"
        );

        return;
    }

    setButtonLoading(
        elements.addSchoolButton,
        true,
        "ADDING..."
    );

    try {

        const url =
            `${API_BASE_URL}/add` +
            `?schoolName=${encodeURIComponent(name)}` +
            `&location=${encodeURIComponent(location)}`;

        const response = await fetch(
            url,
            {
                method: "POST"
            }
        );

        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }

        /*
         * Backend returns the newly created ID
         * as plain text.
         *
         * Example:
         * 10
         */

        const idText =
            (await response.text()).trim();

        const createdSchoolId =
            Number(idText);

        if (!Number.isFinite(createdSchoolId)) {

            throw new Error(
                `Unexpected add response: ${idText}`
            );

        }

        showNotification(
            `School created. ID: ${createdSchoolId}`,
            "success"
        );

        addActivity(
            `New school "${name}" added`,
            "create"
        );

        // Clear form
        elements.addSchoolForm.reset();

        // Refresh registry
        await getAllSchools();

    } catch (error) {

        console.error(
            "addSchool failed:",
            error
        );

        showNotification(
            "Unable to add school.",
            "error"
        );

    } finally {

        setButtonLoading(
            elements.addSchoolButton,
            false,
            "ADD SCHOOL"
        );

    }
}


/* =========================================================
   SEARCH SCHOOL BY ID
   ========================================================= */

async function getSchoolById(event) {

    event.preventDefault();

    elements.searchSchoolIdError.textContent = "";

    elements.searchResult.replaceChildren();

    const idValue =
        elements.searchSchoolId.value.trim();

    const id =
        Number(idValue);

    /*
     * Validate ID
     */

    if (
        !idValue ||
        !Number.isInteger(id) ||
        id <= 0
    ) {

        elements.searchSchoolIdError.textContent =
            "Enter a valid school ID greater than 0.";

        return;
    }

    setButtonLoading(
        elements.searchSchoolButton,
        true,
        "SEARCHING..."
    );

    try {

        const response = await fetch(
            `${API_BASE_URL}/getById?id=${encodeURIComponent(id)}`
        );

        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }

        const data =
            await parseJsonResponse(response);

        /*
         * Your backend currently returns
         * an empty School object when the
         * school doesn't exist.
         *
         * Therefore check data.id.
         */

        if (
            data == null ||
            data.id === null
        ) {

            renderNotFound();

            addActivity(
                `School ID ${id} not found`,
                "search"
            );

            showNotification(
                "School not found.",
                "info"
            );

            return;
        }

        renderSearchResult(data);

        addActivity(
            `School ID ${id} retrieved`,
            "search"
        );

    } catch (error) {

        console.error(
            "getSchoolById failed:",
            error
        );

        renderSearchError(
            "Unable to retrieve the school."
        );

        showNotification(
            "Unable to search the registry.",
            "error"
        );

    } finally {

        setButtonLoading(
            elements.searchSchoolButton,
            false,
            "SEARCH"
        );

    }
}


/* =========================================================
   UPDATE SCHOOL
   ========================================================= */

async function updateSchool(event) {

    event.preventDefault();

    clearEditFormErrors();

    const id =
        Number(elements.editSchoolId.value);

    const name =
        elements.editSchoolName.value.trim();

    const location =
        elements.editSchoolLocation.value.trim();

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        showNotification(
            "Invalid school ID.",
            "error"
        );

        return;
    }

    if (
        !validateSchoolFields(
            name,
            location,
            elements.editSchoolNameError,
            elements.editSchoolLocationError
        )
    ) {

        showNotification(
            "Check the highlighted fields.",
            "warning"
        );

        return;
    }

    setButtonLoading(
        elements.saveEditButton,
        true,
        "SAVING..."
    );

    try {

        const url =
            `${API_BASE_URL}/update` +
            `?id=${encodeURIComponent(id)}` +
            `&name=${encodeURIComponent(name)}` +
            `&location=${encodeURIComponent(location)}`;

        const response = await fetch(
            url,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }

        const updatedSchool =
            await parseJsonResponse(response);

        if (
            updatedSchool == null ||
            updatedSchool.id === null
        ) {

            throw new Error(
                "Invalid updated school response."
            );

        }

        showNotification(
            "School record updated.",
            "success"
        );

        addActivity(
            `School "${name}" updated`,
            "update"
        );

        closeEditModal();

        await getAllSchools();

    } catch (error) {

        console.error(
            "updateSchool failed:",
            error
        );

        showNotification(
            "Unable to update school.",
            "error"
        );

    } finally {

        setButtonLoading(
            elements.saveEditButton,
            false,
            "SAVE CHANGES"
        );

    }
}


/* =========================================================
   DELETE SCHOOL
   ========================================================= */

async function deleteSchool() {

    if (
        !deleteCandidate ||
        !Number.isInteger(
            Number(deleteCandidate.id)
        )
    ) {

        closeDeleteModal();

        return;
    }

    setButtonLoading(
        elements.confirmDeleteButton,
        true,
        "DELETING..."
    );

    try {

        const response = await fetch(

            `${API_BASE_URL}/deleteById?id=${encodeURIComponent(deleteCandidate.id)}`,

            {
                method: "DELETE"
            }

        );

        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }

        /*
         * Your backend returns:
         *
         * true
         *
         * or
         *
         * false
         */

        const resultText =
            (await response.text())
                .trim()
                .toLowerCase();

        const wasDeleted =
            resultText === "true";

        if (!wasDeleted) {

            showNotification(
                "Backend refused the delete operation.",
                "error"
            );

            return;
        }

        addActivity(
            `School "${deleteCandidate.name ?? deleteCandidate.id}" deactivated`,
            "delete"
        );

        showNotification(
            "School deactivated.",
            "success"
        );

        closeDeleteModal();

        await getAllSchools();

    } catch (error) {

        console.error(
            "deleteSchool failed:",
            error
        );

        showNotification(
            "Unable to delete school.",
            "error"
        );

    } finally {

        setButtonLoading(
            elements.confirmDeleteButton,
            false,
            "DELETE SCHOOL"
        );

    }
}


/* =========================================================
   RENDER SCHOOL TABLE
   ========================================================= */

function renderSchools() {

    const query =
        elements.tableSearch.value
            .trim()
            .toLowerCase();

    const status =
        elements.statusFilter.value;

    /*
     * Filter schools
     */

    const filtered =
        schools.filter(school => {

            const searchableText = [
                school.id,
                school.name,
                school.location
            ]
                .map(
                    value =>
                        String(value ?? "")
                            .toLowerCase()
                )
                .join(" ");

            const matchesSearch =
                searchableText.includes(query);

            const matchesStatus =

                status === "all" ||

                (
                    status === "active" &&
                    school.isActive === true
                ) ||

                (
                    status === "inactive" &&
                    school.isActive === false
                );

            return (
                matchesSearch &&
                matchesStatus
            );

        });

    /*
     * Sort schools
     */

    const sorted =
        [...filtered]
            .sort(compareSchools);

    /*
     * Clear old table rows
     */

    elements.schoolsTableBody
        .replaceChildren();

    /*
     * Create table rows
     */

    sorted.forEach(school => {

        elements.schoolsTableBody
            .appendChild(
                createSchoolRow(school)
            );

    });

    const hasAny =
        schools.length > 0;

    const hasFiltered =
        sorted.length > 0;

    /*
     * Empty State
     */

    elements.emptyState.classList.toggle(
        "hidden",
        hasAny || hasFiltered
    );

    /*
     * Registry Status
     */

    if (!hasAny) {

        elements.tableStatus.textContent =
            "NO RECORDS IN REGISTRY";

    } else if (!hasFiltered) {

        elements.tableStatus.textContent =
            "NO MATCHING RECORDS";

    } else {

        elements.tableStatus.textContent =
            `SHOWING ${sorted.length} OF ${schools.length} SCHOOL${schools.length === 1 ? "" : "S"}`;

    }
}


/* =========================================================
   CREATE SCHOOL TABLE ROW
   ========================================================= */

function createSchoolRow(school) {

    const row =
        document.createElement("tr");

    /*
     * ID
     */

    row.appendChild(
        createTextCell(
            school.id ?? "—"
        )
    );

    /*
     * Name
     */

    row.appendChild(
        createTextCell(
            school.name ?? "Unnamed"
        )
    );

    /*
     * Location
     */

    row.appendChild(
        createTextCell(
            school.location ?? "Unknown"
        )
    );

    /*
     * Status
     */

    const statusCell =
        document.createElement("td");

    const badge =
        document.createElement("span");

    badge.className =
        `status-badge ${
            school.isActive
                ? "status-active"
                : "status-inactive"
        }`;

    badge.textContent =
        school.isActive
            ? "ACTIVE"
            : "INACTIVE";

    statusCell.appendChild(
        badge
    );

    row.appendChild(
        statusCell
    );

    /*
     * Created Date
     */

    row.appendChild(
        createTextCell(
            formatDate(
                school.createdDate
            )
        )
    );

    /*
     * Updated Date
     */

    row.appendChild(
        createTextCell(
            formatDate(
                school.updatedDate,
                true
            )
        )
    );

    /*
     * Actions
     */

    const actionCell =
        document.createElement("td");

    const group =
        document.createElement("div");

    group.className =
        "action-group";

    /*
     * Edit Button
     */

    const editButton =
        document.createElement("button");

    editButton.type =
        "button";

    editButton.className =
        "action-button";

    editButton.textContent =
        "EDIT";

    editButton.addEventListener(
        "click",
        () => openEditModal(school)
    );

    /*
     * Delete Button
     */

    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "action-button action-delete";

    deleteButton.textContent =
        "DELETE";

    deleteButton.addEventListener(
        "click",
        () => openDeleteModal(school)
    );

    group.append(
        editButton,
        deleteButton
    );

    actionCell.appendChild(
        group
    );

    row.appendChild(
        actionCell
    );

    return row;
}


/* =========================================================
   RENDER SEARCH RESULT
   ========================================================= */

function renderSearchResult(school) {

    elements.searchResult
        .replaceChildren();

    const card =
        document.createElement("div");

    card.className =
        "search-card";

    const grid =
        document.createElement("div");

    grid.className =
        "search-card-grid";

    const details = [

        [
            "School ID",
            school.id
        ],

        [
            "School Name",
            school.name ?? "Unnamed"
        ],

        [
            "Location",
            school.location ?? "Unknown"
        ],

        [
            "Status",
            school.isActive
                ? "Active"
                : "Inactive"
        ],

        [
            "Created Date",
            formatDate(
                school.createdDate
            )
        ],

        [
            "Updated Date",
            formatDate(
                school.updatedDate,
                true
            )
        ]

    ];

    details.forEach(
        ([label, value]) => {

            const detail =
                document.createElement("div");

            detail.className =
                "search-detail";

            const labelElement =
                document.createElement("span");

            labelElement.textContent =
                label;

            const valueElement =
                document.createElement("strong");

            valueElement.textContent =
                String(value);

            detail.append(
                labelElement,
                valueElement
            );

            grid.appendChild(
                detail
            );

        }
    );

    card.appendChild(
        grid
    );

    elements.searchResult
        .appendChild(card);
}


/* =========================================================
   SCHOOL NOT FOUND
   ========================================================= */

function renderNotFound() {

    elements.searchResult
        .replaceChildren();

    const message =
        document.createElement("p");

    message.className =
        "not-found-message";

    message.textContent =
        "SCHOOL NOT FOUND IN ACTIVE REGISTRY.";

    elements.searchResult
        .appendChild(message);
}


/* =========================================================
   SEARCH ERROR
   ========================================================= */

function renderSearchError(text) {

    elements.searchResult
        .replaceChildren();

    const message =
        document.createElement("p");

    message.className =
        "error-message";

    message.textContent =
        text;

    elements.searchResult
        .appendChild(message);
}


/* =========================================================
   EDIT MODAL
   ========================================================= */

function openEditModal(school) {

    clearEditFormErrors();

    elements.editSchoolId.value =
        school.id ?? "";

    elements.editSchoolName.value =
        school.name ?? "";

    elements.editSchoolLocation.value =
        school.location ?? "";

    openModal(
        elements.editModal
    );

    elements.editSchoolName.focus();
}


function closeEditModal() {

    closeModal(
        elements.editModal
    );

    elements.editSchoolForm.reset();

    clearEditFormErrors();
}


/* =========================================================
   DELETE MODAL
   ========================================================= */

function openDeleteModal(school) {

    deleteCandidate =
        school;

    elements.deleteMessage.textContent =
        `Deactivate "${school.name ?? "this school"}" from the active registry?`;

    openModal(
        elements.deleteModal
    );
}


function closeDeleteModal() {

    closeModal(
        elements.deleteModal
    );

    deleteCandidate =
        null;
}


/* =========================================================
   GENERIC MODAL FUNCTIONS
   ========================================================= */

function openModal(modal) {

    modal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(modal) {

    modal.classList.add(
        "hidden"
    );

    if (
        elements.editModal.classList.contains("hidden") &&
        elements.deleteModal.classList.contains("hidden")
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }
}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

function handleEscapeKey(event) {

    if (event.key !== "Escape") {
        return;
    }

    if (
        !elements.editModal.classList.contains(
            "hidden"
        )
    ) {

        closeEditModal();

    }

    if (
        !elements.deleteModal.classList.contains(
            "hidden"
        )
    ) {

        closeDeleteModal();

    }
}


/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

function updateDashboardStatistics() {

    const total =
        schools.length;

    const active =
        schools.filter(
            school =>
                school.isActive === true
        ).length;

    const inactive =
        schools.filter(
            school =>
                school.isActive === false
        ).length;

    const updated =
        schools.filter(
            school =>
                Boolean(
                    school.updatedDate
                )
        ).length;

    elements.totalSchools.textContent =
        total;

    elements.activeSchools.textContent =
        active;

    elements.inactiveSchools.textContent =
        inactive;

    elements.recentlyUpdated.textContent =
        updated;
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateSchoolFields(
    name,
    location,
    nameErrorElement,
    locationErrorElement
) {

    let valid =
        true;

    /*
     * Validate School Name
     */

    if (!name) {

        nameErrorElement.textContent =
            "School name is required.";

        valid =
            false;

    } else if (
        name.length > 120
    ) {

        nameErrorElement.textContent =
            "Maximum 120 characters.";

        valid =
            false;

    }

    /*
     * Validate Location
     */

    if (!location) {

        locationErrorElement.textContent =
            "Location is required.";

        valid =
            false;

    } else if (
        location.length > 120
    ) {

        locationErrorElement.textContent =
            "Maximum 120 characters.";

        valid =
            false;

    }

    return valid;
}


/* =========================================================
   CLEAR VALIDATION ERRORS
   ========================================================= */

function clearAddFormErrors() {

    elements.schoolNameError.textContent =
        "";

    elements.schoolLocationError.textContent =
        "";
}


function clearEditFormErrors() {

    elements.editSchoolNameError.textContent =
        "";

    elements.editSchoolLocationError.textContent =
        "";
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    value,
    showNeverUpdated = false
) {

    if (!value) {

        return showNeverUpdated
            ? "NEVER UPDATED"
            : "N/A";

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "INVALID DATE";

    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


/* =========================================================
   CYBERPUNK TOAST NOTIFICATIONS
   ========================================================= */

function showNotification(
    message,
    type = "info"
) {

    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;

    const title =
        document.createElement("strong");

    title.textContent = {

        success: "SYSTEM SUCCESS",

        error: "SYSTEM ERROR",

        warning: "SYSTEM WARNING",

        info: "SYSTEM INFO"

    }[type] ?? "SYSTEM INFO";

    const body =
        document.createElement("p");

    body.textContent =
        message;

    toast.append(
        title,
        body
    );

    elements.toastContainer
        .appendChild(toast);

    setTimeout(
        () => {
            toast.remove();
        },
        4000
    );
}


/* =========================================================
   BUTTON LOADING
   ========================================================= */

function setButtonLoading(
    button,
    loading,
    text
) {

    if (!button) {
        return;
    }

    button.disabled =
        loading;

    button.textContent =
        text;
}


/* =========================================================
   TABLE LOADING
   ========================================================= */

function setTableLoading(loading) {

    if (!loading) {
        return;
    }

    elements.tableStatus.textContent =
        "LOADING SCHOOL REGISTRY...";

    elements.schoolsTableBody
        .replaceChildren();
}


/* =========================================================
   CREATE SAFE TABLE CELL
   ========================================================= */

function createTextCell(value) {

    const cell =
        document.createElement("td");

    cell.textContent =
        String(value);

    return cell;
}


/* =========================================================
   SORTING
   ========================================================= */

function changeSort(key) {

    if (
        sortState.key === key
    ) {

        sortState.direction =
            sortState.direction === "asc"
                ? "desc"
                : "asc";

    } else {

        sortState.key =
            key;

        sortState.direction =
            "asc";

    }

    renderSchools();
}


function compareSchools(a, b) {

    const aValue =
        getSortableValue(
            a,
            sortState.key
        );

    const bValue =
        getSortableValue(
            b,
            sortState.key
        );

    let comparison;

    /*
     * Numeric comparison
     */

    if (
        typeof aValue === "number" &&
        typeof bValue === "number"
    ) {

        comparison =
            aValue - bValue;

    } else {

        /*
         * String comparison
         */

        comparison =
            String(aValue)
                .localeCompare(
                    String(bValue),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                );

    }

    return sortState.direction === "asc"
        ? comparison
        : -comparison;
}


function getSortableValue(
    school,
    key
) {

    /*
     * Date sorting
     */

    if (
        key === "createdDate" ||
        key === "updatedDate"
    ) {

        if (!school[key]) {
            return 0;
        }

        const time =
            new Date(
                school[key]
            ).getTime();

        return Number.isNaN(time)
            ? 0
            : time;

    }

    /*
     * ID sorting
     */

    if (key === "id") {

        return Number(
            school.id
        ) || 0;

    }

    /*
     * Name / Location sorting
     */

    return school[key] ?? "";
}


/* =========================================================
   SIDEBAR NAVIGATION
   ========================================================= */

function navigateToSection(button) {

    elements.navLinks.forEach(
        link => {

            link.classList.remove(
                "active"
            );

        }
    );

    button.classList.add(
        "active"
    );

    const target =
        document.getElementById(
            button.dataset.target
        );

    if (target) {

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    /*
     * Automatically close sidebar
     * on mobile/tablet.
     */

    if (
        window.innerWidth <= 860
    ) {

        elements.sidebar.classList.remove(
            "open"
        );

        elements.menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }
}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const open =
        elements.sidebar.classList.toggle(
            "open"
        );

    elements.menuToggle.setAttribute(
        "aria-expanded",
        String(open)
    );
}


/* =========================================================
   GO TO ADD SCHOOL SECTION
   ========================================================= */

function focusAddSection() {

    document
        .getElementById("add-section")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    setTimeout(
        () => {
            elements.schoolName.focus();
        },
        250
    );
}


/* =========================================================
   SYSTEM ACTIVITY LOG
   ========================================================= */

function addActivity(
    text,
    type
) {

    const now =
        new Date();

    activityLog.unshift({

        text: text,

        type: type,

        time: now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        )

    });

    /*
     * Keep only latest 6 actions.
     */

    activityLog =
        activityLog.slice(
            0,
            6
        );

    renderActivity();
}


/* =========================================================
   RENDER SYSTEM ACTIVITY
   ========================================================= */

function renderActivity() {

    elements.activityList
        .replaceChildren();

    if (
        activityLog.length === 0
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "activity-empty";

        empty.textContent =
            "No activity yet.";

        elements.activityList
            .appendChild(empty);

        return;
    }

    activityLog.forEach(
        item => {

            const row =
                document.createElement("div");

            row.className =
                "activity-item";

            /*
             * Time
             */

            const time =
                document.createElement("span");

            time.className =
                "activity-time";

            time.textContent =
                item.time;

            /*
             * Activity Description
             */

            const text =
                document.createElement("span");

            text.className =
                "activity-text";

            text.textContent =
                item.text;

            /*
             * Activity Type
             */

            const type =
                document.createElement("span");

            type.className =
                `activity-type ${item.type}`;

            type.textContent =
                item.type;

            row.append(
                time,
                text,
                type
            );

            elements.activityList
                .appendChild(row);

        }
    );
}


/* =========================================================
   LIVE CYBERPUNK CLOCK
   ========================================================= */

function startClock() {

    const tick = () => {

        const now =
            new Date();

        /*
         * Time
         */

        elements.liveTime.textContent =
            now.toLocaleTimeString(
                [],
                {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

        /*
         * Date
         */

        elements.liveDate.textContent =
            now.toLocaleDateString(
                [],
                {
                    month: "short",
                    day: "2-digit",
                    year: "numeric"
                }
            ).toUpperCase();

    };

    /*
     * Run immediately.
     */

    tick();

    /*
     * Then update every second.
     */

    setInterval(
        tick,
        1000
    );
}


/* =========================================================
   SAFE JSON PARSER
   ========================================================= */

async function parseJsonResponse(response) {

    const text =
        await response.text();

    try {

        return JSON.parse(
            text
        );

    } catch (error) {

        throw new Error(
            `Invalid JSON returned by backend: ${error.message}`
        );

    }
}