const API_BASE_URL = "http://localhost:8080/school";

let schools = [];
let deleteCandidate = null;

let sortState = {
    key: "id",
    direction: "asc"
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindEvents();
    getAllSchools();
});


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

function cacheElements() {

    // Sidebar
    elements.sidebar = document.getElementById("sidebar");
    elements.menuToggle = document.getElementById("menu-toggle");
    elements.refreshButton = document.getElementById("refresh-button");
    elements.navLinks = document.querySelectorAll(".nav-link");

    // Dashboard statistics
    elements.totalSchools = document.getElementById("total-schools");
    elements.activeSchools = document.getElementById("active-schools");
    elements.inactiveSchools = document.getElementById("inactive-schools");
    elements.recentlyUpdated = document.getElementById("recently-updated");

    // Add School
    elements.addSchoolForm = document.getElementById("add-school-form");
    elements.schoolName = document.getElementById("school-name");
    elements.schoolLocation = document.getElementById("school-location");

    elements.schoolNameError =
        document.getElementById("school-name-error");

    elements.schoolLocationError =
        document.getElementById("school-location-error");

    elements.addSchoolButton =
        document.getElementById("add-school-button");

    // Search School
    elements.searchSchoolForm =
        document.getElementById("search-school-form");

    elements.searchSchoolId =
        document.getElementById("search-school-id");

    elements.searchSchoolIdError =
        document.getElementById("search-school-id-error");

    elements.searchSchoolButton =
        document.getElementById("search-school-button");

    elements.searchResult =
        document.getElementById("search-result");

    // School table
    elements.tableSearch =
        document.getElementById("table-search");

    elements.statusFilter =
        document.getElementById("status-filter");

    elements.tableStatus =
        document.getElementById("table-status");

    elements.schoolsTableBody =
        document.getElementById("schools-table-body");

    elements.emptyState =
        document.getElementById("empty-state");

    elements.emptyAddButton =
        document.getElementById("empty-add-button");

    elements.sortButtons =
        document.querySelectorAll(".sort-button");

    // Edit modal
    elements.editModal =
        document.getElementById("edit-modal");

    elements.editSchoolForm =
        document.getElementById("edit-school-form");

    elements.editSchoolId =
        document.getElementById("edit-school-id");

    elements.editSchoolName =
        document.getElementById("edit-school-name");

    elements.editSchoolLocation =
        document.getElementById("edit-school-location");

    elements.editSchoolNameError =
        document.getElementById("edit-school-name-error");

    elements.editSchoolLocationError =
        document.getElementById("edit-school-location-error");

    elements.saveEditButton =
        document.getElementById("save-edit-button");

    elements.closeEditModalButton =
        document.getElementById("close-edit-modal");

    elements.cancelEditButton =
        document.getElementById("cancel-edit-button");

    // Delete modal
    elements.deleteModal =
        document.getElementById("delete-modal");

    elements.deleteMessage =
        document.getElementById("delete-message");

    elements.confirmDeleteButton =
        document.getElementById("confirm-delete-button");

    elements.closeDeleteModalButton =
        document.getElementById("close-delete-modal");

    elements.cancelDeleteButton =
        document.getElementById("cancel-delete-button");

    // Toast notifications
    elements.toastContainer =
        document.getElementById("toast-container");
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function bindEvents() {

    // Add
    elements.addSchoolForm.addEventListener(
        "submit",
        addSchool
    );

    // Search
    elements.searchSchoolForm.addEventListener(
        "submit",
        getSchoolById
    );

    // Update
    elements.editSchoolForm.addEventListener(
        "submit",
        updateSchool
    );

    // Refresh
    elements.refreshButton.addEventListener(
        "click",
        () => getAllSchools(true)
    );

    // Table search
    elements.tableSearch.addEventListener(
        "input",
        renderSchools
    );

    // Status filter
    elements.statusFilter.addEventListener(
        "change",
        renderSchools
    );

    // Sorting
    elements.sortButtons.forEach((button) => {

        button.addEventListener("click", () => {
            changeSort(button.dataset.sort);
        });

    });

    // Sidebar navigation
    elements.navLinks.forEach((button) => {

        button.addEventListener("click", () => {
            navigateToSection(button);
        });

    });

    // Mobile sidebar
    elements.menuToggle.addEventListener(
        "click",
        toggleSidebar
    );

    // Empty-state Add button
    elements.emptyAddButton.addEventListener(
        "click",
        () => {

            document
                .getElementById("add-section")
                .scrollIntoView({
                    behavior: "smooth"
                });

            elements.schoolName.focus();
        }
    );

    // Edit modal
    elements.closeEditModalButton.addEventListener(
        "click",
        closeEditModal
    );

    elements.cancelEditButton.addEventListener(
        "click",
        closeEditModal
    );

    elements.editModal.addEventListener(
        "click",
        (event) => {

            if (event.target === elements.editModal) {
                closeEditModal();
            }

        }
    );

    // Delete modal
    elements.closeDeleteModalButton.addEventListener(
        "click",
        closeDeleteModal
    );

    elements.cancelDeleteButton.addEventListener(
        "click",
        closeDeleteModal
    );

    elements.confirmDeleteButton.addEventListener(
        "click",
        deleteSchool
    );

    elements.deleteModal.addEventListener(
        "click",
        (event) => {

            if (event.target === elements.deleteModal) {
                closeDeleteModal();
            }

        }
    );

    // Escape key closes modal
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
        "Refreshing..."
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
                "Expected an array of schools from /getAll."
            );

        }

        schools = data;

        updateDashboardStatistics();

        renderSchools();

        if (showSuccessMessage) {

            showNotification(
                "School data refreshed successfully.",
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
            "Unable to load schools. Check that the Spring Boot server is running.";

        showNotification(
            "Unable to communicate with the server.",
            "error"
        );

    } finally {

        setTableLoading(false);

        setButtonLoading(
            elements.refreshButton,
            false,
            "Refresh Data"
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


    // Validate
    if (
        !validateSchoolFields(
            name,
            location,
            elements.schoolNameError,
            elements.schoolLocationError
        )
    ) {

        showNotification(
            "Please correct the highlighted fields.",
            "warning"
        );

        return;
    }


    setButtonLoading(
        elements.addSchoolButton,
        true,
        "Adding..."
    );


    try {

        /*
         * Your backend expects query parameters:
         *
         * POST
         * /school/add?schoolName=...&location=...
         */

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
         * Your backend returns only the ID:
         *
         * 10
         *
         * Therefore we use response.text()
         * instead of response.json().
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
            `School successfully created with ID: ${createdSchoolId}`,
            "success"
        );


        // Clear form
        elements.addSchoolForm.reset();


        // Refresh table
        await getAllSchools();


    } catch (error) {

        console.error(
            "addSchool failed:",
            error
        );


        showNotification(
            "Unable to add school. Check the backend connection.",
            "error"
        );

    } finally {

        setButtonLoading(
            elements.addSchoolButton,
            false,
            "Add School"
        );

    }
}


/* =========================================================
   GET SCHOOL BY ID
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
     * Validate School ID
     */

    if (
        !idValue ||
        !Number.isInteger(id) ||
        id <= 0
    ) {

        elements.searchSchoolIdError.textContent =
            "Enter a numeric school ID greater than 0.";


        showNotification(
            "Please enter a valid school ID.",
            "warning"
        );

        return;
    }


    setButtonLoading(
        elements.searchSchoolButton,
        true,
        "Searching..."
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
         * IMPORTANT:
         *
         * Your backend currently does not
         * return HTTP 404.
         *
         * Instead it returns:
         *
         * {
         *     "id": null,
         *     "name": null,
         *     ...
         * }
         *
         * Therefore we check data.id.
         */

        if (
            data == null ||
            data.id === null
        ) {

            renderNotFound();

            showNotification(
                "School not found.",
                "info"
            );

            return;
        }


        renderSearchResult(data);


    } catch (error) {

        console.error(
            "getSchoolById failed:",
            error
        );


        renderSearchError(
            "Unable to retrieve the school. Check the server connection."
        );


        showNotification(
            "Unable to communicate with the server.",
            "error"
        );


    } finally {

        setButtonLoading(
            elements.searchSchoolButton,
            false,
            "Search School"
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
            "Please correct the highlighted fields.",
            "warning"
        );

        return;
    }


    setButtonLoading(
        elements.saveEditButton,
        true,
        "Saving..."
    );


    try {

        /*
         * PUT
         *
         * /school/update
         * ?id=...
         * &name=...
         * &location=...
         */

        const url =
            `${API_BASE_URL}/update` +
            `?id=${encodeURIComponent(id)}` +
            `&name=${encodeURIComponent(name)}` +
            `&location=${encodeURIComponent(location)}`;


        const response =
            await fetch(
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
                "Backend did not return a valid updated school."
            );

        }


        showNotification(
            "School updated successfully.",
            "success"
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
            "Save Changes"
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

        showNotification(
            "No valid school selected for deletion.",
            "error"
        );


        closeDeleteModal();

        return;
    }


    setButtonLoading(
        elements.confirmDeleteButton,
        true,
        "Deleting..."
    );


    try {

        /*
         * DELETE
         *
         * /school/deleteById?id=...
         */

        const response =
            await fetch(

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
         * Backend returns:
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
                "Unable to delete school.",
                "error"
            );

            return;
        }


        showNotification(
            "School deleted successfully.",
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
            "Unable to delete school. Check the server connection.",
            "error"
        );


    } finally {

        setButtonLoading(
            elements.confirmDeleteButton,
            false,
            "Delete School"
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
     * Client-side filtering.
     *
     * No backend request is required.
     */

    const filteredSchools =
        schools.filter((school) => {

            const searchableText = [

                school.id,
                school.name,
                school.location

            ]
                .map(
                    (value) =>
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
     * Sort copy of filtered array
     */

    const sortedSchools =
        [...filteredSchools]
            .sort(compareSchools);


    /*
     * Remove previous table rows
     */

    elements.schoolsTableBody
        .replaceChildren();


    /*
     * Create rows
     */

    sortedSchools.forEach(
        (school) => {

            elements.schoolsTableBody
                .appendChild(
                    createSchoolRow(school)
                );

        }
    );


    const hasAnySchools =
        schools.length > 0;


    const hasFilteredSchools =
        sortedSchools.length > 0;


    /*
     * Empty state
     */

    elements.emptyState.classList.toggle(
        "hidden",
        hasAnySchools ||
        hasFilteredSchools
    );


    /*
     * Table status
     */

    if (!hasAnySchools) {

        elements.tableStatus.textContent = "";

    } else if (!hasFilteredSchools) {

        elements.tableStatus.textContent =
            "No schools match the current search or filter.";

    } else {

        elements.tableStatus.textContent =
            `Showing ${sortedSchools.length} of ${schools.length} school${schools.length === 1 ? "" : "s"}.`;

    }
}


/* =========================================================
   CREATE SCHOOL TABLE ROW
   ========================================================= */

function createSchoolRow(school) {

    const row =
        document.createElement("tr");


    // ID
    row.appendChild(
        createTextCell(
            school.id ?? "—"
        )
    );


    // Name
    row.appendChild(
        createTextCell(
            school.name ?? "Unnamed"
        )
    );


    // Location
    row.appendChild(
        createTextCell(
            school.location ?? "Unknown"
        )
    );


    // Status
    const statusCell =
        document.createElement("td");


    const statusBadge =
        document.createElement("span");


    statusBadge.className =
        `status-badge ${
            school.isActive
                ? "status-active"
                : "status-inactive"
        }`;


    statusBadge.textContent =
        school.isActive
            ? "Active"
            : "Inactive";


    statusCell.appendChild(
        statusBadge
    );


    row.appendChild(
        statusCell
    );


    // Created Date
    row.appendChild(
        createTextCell(
            formatDate(
                school.createdDate
            )
        )
    );


    // Updated Date
    row.appendChild(
        createTextCell(
            formatDate(
                school.updatedDate,
                true
            )
        )
    );


    // Actions
    const actionsCell =
        document.createElement("td");


    const actionGroup =
        document.createElement("div");


    actionGroup.className =
        "action-group";


    /*
     * Edit button
     */

    const editButton =
        document.createElement("button");


    editButton.type =
        "button";


    editButton.className =
        "action-button";


    editButton.textContent =
        "Edit";


    editButton.addEventListener(
        "click",
        () => openEditModal(school)
    );


    /*
     * Delete button
     */

    const deleteButton =
        document.createElement("button");


    deleteButton.type =
        "button";


    deleteButton.className =
        "action-button action-delete";


    deleteButton.textContent =
        "Delete";


    deleteButton.addEventListener(
        "click",
        () => openDeleteModal(school)
    );


    actionGroup.append(
        editButton,
        deleteButton
    );


    actionsCell.appendChild(
        actionGroup
    );


    row.appendChild(
        actionsCell
    );


    return row;
}


/* =========================================================
   SEARCH RESULT
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
        "School not found.";


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


    elements.editSchoolName
        .focus();
}


function closeEditModal() {

    closeModal(
        elements.editModal
    );


    elements.editSchoolForm
        .reset();


    clearEditFormErrors();
}


/* =========================================================
   DELETE MODAL
   ========================================================= */

function openDeleteModal(school) {

    deleteCandidate =
        school;


    elements.deleteMessage.textContent =
        `Are you sure you want to delete "${school.name ?? "this school"}"?`;


    openModal(
        elements.deleteModal
    );


    elements.confirmDeleteButton
        .focus();
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


    const anyModalOpen =

        !elements.editModal.classList.contains(
            "hidden"
        ) ||

        !elements.deleteModal.classList.contains(
            "hidden"
        );


    if (!anyModalOpen) {

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
            (school) =>
                school.isActive === true
        ).length;


    const inactive =
        schools.filter(
            (school) =>
                school.isActive === false
        ).length;


    const updated =
        schools.filter(
            (school) =>
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
   FORM VALIDATION
   ========================================================= */

function validateSchoolFields(
    name,
    location,
    nameErrorElement,
    locationErrorElement
) {

    let isValid =
        true;


    /*
     * School Name
     */

    if (!name) {

        nameErrorElement.textContent =
            "School name is required.";

        isValid =
            false;

    } else if (name.length > 120) {

        nameErrorElement.textContent =
            "School name must be 120 characters or fewer.";

        isValid =
            false;
    }


    /*
     * Location
     */

    if (!location) {

        locationErrorElement.textContent =
            "Location is required.";

        isValid =
            false;

    } else if (location.length > 120) {

        locationErrorElement.textContent =
            "Location must be 120 characters or fewer.";

        isValid =
            false;
    }


    return isValid;
}


/* =========================================================
   CLEAR FORM ERRORS
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
   DATE FORMATTING
   ========================================================= */

function formatDate(
    value,
    showNeverUpdated = false
) {

    /*
     * updatedDate can be null.
     */

    if (!value) {

        return showNeverUpdated
            ? "Never Updated"
            : "Not Available";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Invalid Date";

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
   TOAST NOTIFICATIONS
   ========================================================= */

function showNotification(
    message,
    type = "info"
) {

    const allowedTypes = [
        "success",
        "error",
        "warning",
        "info"
    ];


    const finalType =
        allowedTypes.includes(type)
            ? type
            : "info";


    const toast =
        document.createElement("div");


    toast.className =
        `toast toast-${finalType}`;


    const title =
        document.createElement("strong");


    title.textContent = {

        success: "Success",

        error: "Error",

        warning: "Warning",

        info: "Information"

    }[finalType];


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


    /*
     * Automatically remove toast
     * after 4 seconds.
     */

    window.setTimeout(
        () => {

            toast.remove();

        },
        4000
    );
}


/* =========================================================
   BUTTON LOADING STATE
   ========================================================= */

function setButtonLoading(
    button,
    isLoading,
    loadingText
) {

    if (!button) {
        return;
    }


    button.disabled =
        isLoading;


    if (isLoading) {

        button.dataset.originalText =
            button.textContent;


        button.textContent =
            loadingText;

    } else {

        button.textContent =
            loadingText ||
            button.dataset.originalText ||
            button.textContent;


        delete button.dataset.originalText;

    }
}


/* =========================================================
   TABLE LOADING STATE
   ========================================================= */

function setTableLoading(isLoading) {

    if (isLoading) {

        elements.tableStatus.textContent =
            "Loading schools...";


        elements.schoolsTableBody
            .replaceChildren();

    }
}


/* =========================================================
   CREATE SAFE TEXT CELL
   ========================================================= */

function createTextCell(value) {

    const cell =
        document.createElement("td");


    /*
     * textContent is used instead of
     * unsafe innerHTML.
     */

    cell.textContent =
        String(value);


    return cell;
}


/* =========================================================
   SORTING
   ========================================================= */

function changeSort(key) {

    /*
     * Clicking the same column again
     * reverses the direction.
     */

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


    let comparison =
        0;


    /*
     * Number comparison
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
     * Dates
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
     * ID
     */

    if (key === "id") {

        return Number(
            school.id
        ) || 0;

    }


    /*
     * Name / Location
     */

    return school[key] ?? "";
}


/* =========================================================
   SIDEBAR NAVIGATION
   ========================================================= */

function navigateToSection(button) {

    /*
     * Remove active style
     * from previous item.
     */

    elements.navLinks.forEach(
        (link) => {

            link.classList.remove(
                "active"
            );

        }
    );


    /*
     * Activate selected item.
     */

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
     * Close sidebar automatically
     * on tablet/mobile.
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

    const isOpen =
        elements.sidebar.classList.toggle(
            "open"
        );


    elements.menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );
}


/* =========================================================
   JSON RESPONSE PARSER
   ========================================================= */

async function parseJsonResponse(response) {

    /*
     * Read response as text first.
     *
     * This allows us to detect invalid JSON
     * and provide a meaningful error.
     */

    const text =
        await response.text();


    try {

        return JSON.parse(text);

    } catch (error) {

        throw new Error(
            `Invalid JSON returned by the backend: ${error.message}`
        );

    }
}