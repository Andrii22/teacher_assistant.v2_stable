function showContent(contentId) {
    const dynamicContent = document.getElementById('dynamic-content');

    if (!dynamicContent) {
        console.error("Couldn't find the element with ID 'dynamic-content'.");
        return;
    }

    dynamicContent.classList.remove('hidden');

    const contentSections = dynamicContent.querySelectorAll('.content');
    contentSections.forEach(section => {
        section.style.display = 'none';
    });

    const selectedContent = document.getElementById(contentId);

    if (!selectedContent) {
        console.error(`Couldn't find the element with ID '${contentId}'.`);
        return;
    }

    selectedContent.style.display = 'block';

    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.classList.remove('active');
    });

    const activeButton = document.querySelector(`.nav-button[onclick*="${contentId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}
$("#select-all-users").click(function(){
    $(".user-checkbox").prop('checked', $(this).prop('checked'));
});
$("#delete-selected").click(function() {
    let selectedUsers = $(".user-checkbox:checked").map(function(){
        return $(this).closest("tr").find("td:nth-child(2)").text(); 
    }).get();

    if (selectedUsers.length === 0) {
        alert("Оберіть користувача для видалення!");
        return;
    }

    if (confirm(`Видалити з системи: ${selectedUsers.join(", ")}?`)) {
        let selectedUserIds = $(".user-checkbox:checked").map(function(){
            return $(this).data("user-id");
        }).get();

        deleteSelectedUsers(selectedUserIds);
    }
});

$("#block-selected").click(function() {
    let selectedUsers = $(".user-checkbox:checked").map(function(){
        let username = $(this).closest("tr").find("td:nth-child(2)").text(); 
        return {
            userId: $(this).data("user-id"),
            username: username, 
            status: $(this).data("status") 
        };
    }).get();

    if (selectedUsers.length === 0) {
        alert("Оберіть користувача для блокування!");
        return;
    }
    let usernamesToBlock = selectedUsers.map(user => user.username);
    if (confirm(`Заблокувати: ${usernamesToBlock.join(", ")}?`)) {
        updateSelectedUserStatus(selectedUsers, "Заблоковано");
    }
});

$("#unblock-selected").click(function() {
    let selectedUsers = $(".user-checkbox:checked").map(function(){
        let username = $(this).closest("tr").find("td:nth-child(2)").text(); 
        return {
            userId: $(this).data("user-id"),
            username: username,
            status: $(this).data("status") 
        };
    }).get();

    if (selectedUsers.length === 0) {
        alert("Оберіть користувача для розблокування!");
        return;
    }
    let activeUsersFound = selectedUsers.some(user => user.status === "Активний");
    if (activeUsersFound) {
        alert("Тільки заблокований учень може бути розблокований! \n Перевірте статус та спробуйте знову.");
        return;
    }
    let usernamesToUnblock = selectedUsers.map(user => user.username);
    
    if (confirm(`Розблокувати : ${usernamesToUnblock.join(", ")}?`)) {
        updateSelectedUserStatus(selectedUsers, "Активний");
    }
});
$(document).ready(function() {
    initializeUIInteractions();
});

function initializeUIInteractions() {
    $("#username-filter, #class-filter, #table-search").on("input", applyFilters);
    $("#online-filter").on("change", applyFilters);

    $("#user-list").on("click", "button", function(e) {
        const userId = $(this).data("user-id");

        if ($(this).hasClass("delete-button")) {
            handleUserDeletion(userId);
        } else if ($(this).hasClass("block-button") || $(this).hasClass("unblock-button")) {
            const isBlock = $(this).hasClass("block-button");
            handleBlockUnblock(userId, isBlock);
        }
    });
}