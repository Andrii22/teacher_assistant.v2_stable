function showStudents() {
    console.log('showStudents function is called');

    $.get('/user/get_students', function(data) {
        $('#user-list').html(data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Request failed: " + errorThrown);
    });
}

function deleteSelectedUsers(userIds) {
    $.ajax({
        type: "POST",
        url: "/user/delete_selected_users", 
        data: {
            user_ids: userIds
        },
        success: function(response) {
            if (response === "success") {
                userIds.forEach(id => {
                    $(`.user-checkbox[data-user-id="${id}"]`).closest("tr").remove();
                });
            } else {
                alert("Помилка при спробі видалити користувача, спробуйте ще раз!");
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
            alert("Виникла помилка. Будь ласка, перевірте консоль для отримання деталей.");
        }
    });
}
function updateSelectedUserStatus(users, newStatus) {
    const userIds = users.map(user => user.userId);
    $.ajax({
        type: "POST",
        url: "/user/update_user_status",
        data: { user_ids: userIds, new_status: newStatus },
        success: function(response) {
            if (response === "success") {
                users.forEach(user => {
                    var statusCell = $(`.user-checkbox[data-user-id="${user.userId}"]`).closest("tr").find(".user-status");
                    statusCell.text(newStatus);
                });
            } else {
                alert(`Не вдалося встановити статус користувача на ${newStatus}.`);
            }
        },
        error: function() {
            alert(`Під час встановлення статусу користувача сталася помилка ${newStatus}.`);
        }
    });
}
function updateTableStatus(userId, newStatus) {
    $(`#user-status-${userId}`).text(newStatus);
}
function applyFilters() {
    console.log("applyFilters called");
    $("#status-filter").change(applyFilters);
    const usernameValue = $("#username-filter").val().toLowerCase();
    const classValue = $("#class-filter").val().toLowerCase();
    const onlineValue = $("#online-filter").val().toLowerCase();
    const statusValue = $("#status-filter").val().toLowerCase();
    const searchText = $("#table-search").val().toLowerCase();
    $("#user-list tr").each(function() {
        const row = $(this);
        const username = row.find("td:nth-child(2)").text().toLowerCase();
        const userClass = row.find("td:nth-child(3)").text().toLowerCase();
        const onlineStatus = row.find("td:nth-child(4)").text().toLowerCase();
        const ipAddress = row.find("td:nth-child(5)").text().toLowerCase();
        const status = row.find("td:nth-child(6)").text().toLowerCase();

        const isUsernameMatch = !usernameValue || username.includes(usernameValue);
        const isClassMatch = !classValue || userClass.includes(classValue);
        const isOnlineMatch = !onlineValue || onlineStatus.includes(onlineValue);
        const isStatusMatch = statusValue === "all" || status === statusValue;
        const isIpMatch = !searchText || ipAddress.includes(searchText);
        const rowText = row.text().toLowerCase();
        const isSearchMatch = !searchText || rowText.includes(searchText);

        if (isUsernameMatch && isClassMatch && isOnlineMatch && isStatusMatch && isSearchMatch && isIpMatch) {
            row.show();
        } else {
            row.hide();
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.help-button').forEach(button => {
        button.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            displayHelpText(topic);
        });
    });
});

function displayHelpText(topic) {
    const helpText = document.getElementById('help-text');
    switch (topic) {
        case 'courses':
            helpText.innerHTML = 'Для взаємодії з <span style="color:#007bff;">Журналом</span> оберіть з випадаючого списку один з місяців. В журналі можна побачити ваші оцінки, відвідуваність тобто "н" та результати проходження курсів.';
            break;
        case 'notes':
            helpText.innerHTML = 'Для взаємодії з <span style="color:#007bff;">Нотатками</span> потрібно просто написати шось в поле для нотатків, та за необхідності дати їй назву. Натиснувши кнопку <span style="color:#007bff;">Зберегти</span> ви збережете нотатку для себе. Після чого якщо ви натиснете на неї то її текст та номер перенесуться в активне поле для взаємодії. Для видалення просто натисніть кнопку <span style="color:#007bff;">Видалити</span>. ';
            break;
        case 'schedule':
            helpText.innerHTML = 'Щоб побачити <span style="color:#007bff;">Графік занять</span> необхдіно натиснути кнопку <span style="color:#007bff;">Оновити</span> щоб графік з`явився на екрані.';
            break;
        case 'materials':
            helpText.innerHTML = 'Щоб процбвати з <span style="color:#007bff;">Навчальними матеріалами</span> потрібно натиснути на папку щоб відкрився її вміст. У папці можуть бути посилання та файли. Щоб перейти по посиланню достатньо клікнути по ньому. Щоб завантажити або переглянути файл натисніть <span style="color:#007bff;">Завантажити</span>.';
            break;
        case 'exams':
            helpText.innerHTML = 'Для взаємодії з <span style="color:#007bff;">Курсами</span> потрібно натиснути кнопку <span style="color:#007bff;">Пройти курс</span> в блоці активного курсу. Після чого обрати відповіді на питання та натиснути кнопку <span style="color:#007bff;">Завершити курс</span>.';
            break;
        default:
            helpText.innerHTML = 'Виберіть тему для отримання допомоги.';
    }
}