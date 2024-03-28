const classNumberSelect = document.getElementById('class-number-select');
const classLetterSelect = document.getElementById('class-letter-select');
const scheduleContainer = document.getElementById('schedule-container');

document.addEventListener("DOMContentLoaded", function () {
    classNumberSelect.addEventListener('change', fetchAndDisplaySchedule);
    classLetterSelect.addEventListener('change', fetchAndDisplaySchedule);

    function fetchAndDisplaySchedule() {
        const classNumber = classNumberSelect.value;
        const classLetter = classLetterSelect.value;
        console.log("Fetching schedule for:", classNumber, classLetter);

        fetch(`/schedule?class_number=${classNumber}&class_letter=${classLetter}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                scheduleContainer.innerHTML = '';
                const days = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця"];
                
                days.forEach(day => {
                    const existingSchedules = data.filter(item => item.day_of_week === day);
                    const dayHeader = document.createElement('h3');
                    dayHeader.innerText = day;
                    scheduleContainer.appendChild(dayHeader);
                    const dayTable = document.createElement('table');
                    const dayTableHeader = `
        <thead>
            <tr>
                <th>Час</th>
                <th>Опис</th>
                <th>Дія</th>
            </tr>
        </thead>
    `;
                    dayTable.innerHTML = dayTableHeader;
                    const tbody = document.createElement('tbody');

                    existingSchedules.forEach(schedule => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${schedule.lesson_time}</td>
                            <td><input type="text" disabled value="${schedule.description || ''}"></td>
                            <td>
                                <button data-day="${day}" class="change-button">Змінити</button>
                                <button data-day="${day}" class="delete-button">Видалити</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });

                    const trInput = document.createElement('tr');
                    trInput.innerHTML = `
                        <td><input type="time"></td>
                        <td><input type="text" placeholder="Опис (опціонально)"></td>
                        <td><button data-day="${day}">Зберегти</button></td>
                    `;
                    tbody.appendChild(trInput);

                    dayTable.appendChild(tbody);
                    scheduleContainer.appendChild(dayTable);
                });
            })
            .catch(error => {
                console.error('Fetch error when displaying schedule:', error);
            });
    }

    fetchAndDisplaySchedule();
});


function saveSchedule(dayOfWeek, buttonElem) {
    const lessonTimeInput = buttonElem.parentNode.previousElementSibling.previousElementSibling.querySelector('input[type="time"]');
    const descriptionInput = buttonElem.parentNode.previousElementSibling.querySelector('input[type="text"]');

    if (!lessonTimeInput || !lessonTimeInput.value) {
        alert("Введіть дійсний час.");
        return;
    }

    const classNumber = classNumberSelect.value;
    const classLetter = classLetterSelect.value;

    const payload = {
        class_number: classNumber,
        class_letter: classLetter,
        day_of_week: dayOfWeek,
        lesson_time: lessonTimeInput.value,
        description: descriptionInput.value  
    };

    // Визначення методу і URL на основі data-action
    const action = buttonElem.getAttribute('data-action');
    const method = action === 'POST' ? 'POST' : 'POST';
    const endpoint = action === 'update' ? '/update-schedule' : '/schedule';

    fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);

        const displayTimeCell = lessonTimeInput.parentNode;
        const displayDescriptionCell = descriptionInput.parentNode;
        displayTimeCell.innerHTML = lessonTimeInput.value;
        displayDescriptionCell.innerHTML = descriptionInput.value;

        if (action === 'update') {
            buttonElem.innerText = "Змінити";
            buttonElem.removeAttribute('data-action');
        } else {
            const actionCell = buttonElem.parentNode;
            actionCell.innerHTML = `
                <button data-day="${dayOfWeek}" class="change-button">Змінити</button>
                <button data-day="${dayOfWeek}" class="delete-button">Видалити</button>
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateSchedule(dayOfWeek, buttonElem) {
    const lessonTimeInput = buttonElem.parentNode.previousElementSibling.previousElementSibling.querySelector('input[type="time"]');
    const descriptionInput = buttonElem.parentNode.previousElementSibling.querySelector('input[type="text"]');

    if (!lessonTimeInput || !lessonTimeInput.value) {
        alert("Введіть дійсний час.");
        return;
    }

    const classNumber = classNumberSelect.value;
    const classLetter = classLetterSelect.value;

    const payload = {
        class_number: classNumber,
        class_letter: classLetter,
        day_of_week: dayOfWeek,
        lesson_time: lessonTimeInput.value,
        description: descriptionInput.value  
    };

    fetch('/update-schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        const displayTimeCell = lessonTimeInput.parentNode;
        const displayDescriptionCell = descriptionInput.parentNode;

        displayTimeCell.innerHTML = lessonTimeInput.value;
        displayDescriptionCell.innerHTML = descriptionInput.value;

        buttonElem.innerText = "Змінити";
        buttonElem.removeAttribute('data-action');
    })
    .catch(error => {
        console.error('Update error:', error);
    });
}

function deleteSchedule(dayOfWeek, buttonElem) {
    const displayTimeCell = buttonElem.parentNode.previousElementSibling.previousElementSibling;
    const lessonTime = displayTimeCell.innerText;
    const descriptionCell = buttonElem.parentNode.previousElementSibling;
    const description = descriptionCell.innerText;

    const classNumber = classNumberSelect.value;
    const classLetter = classLetterSelect.value;

    const payload = {
        class_number: classNumber,
        class_letter: classLetter,
        day_of_week: dayOfWeek,
        lesson_time: lessonTime,
        description: description
    };

    fetch('/schedule', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            const tr = buttonElem.closest('tr');
            tr.parentNode.removeChild(tr);
        })
        .catch(error => {
            console.error('Delete error:', error);
        });
}
function changeSchedule(dayOfWeek, buttonElem) {
    const displayTimeCell = buttonElem.parentNode.previousElementSibling.previousElementSibling; 
    const existingTime = displayTimeCell.innerText;

    const descriptionCell = buttonElem.parentNode.previousElementSibling;
    const existingDescription = descriptionCell.innerText;

    const timeInput = document.createElement('input');
    timeInput.setAttribute('type', 'time');
    timeInput.value = existingTime;

    const descriptionInput = document.createElement('input'); 
    descriptionInput.setAttribute('type', 'text');
    descriptionInput.value = existingDescription;

    displayTimeCell.innerHTML = '';
    displayTimeCell.appendChild(timeInput);

    descriptionCell.innerHTML = '';
    descriptionCell.appendChild(descriptionInput); 

    buttonElem.innerText = "Зберегти"; 
    buttonElem.setAttribute('data-action', 'save'); 
    buttonElem.innerText = "Зберегти";
    buttonElem.setAttribute('data-action', 'update'); 
}
scheduleContainer.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
        const buttonElem = event.target;
        const dayOfWeek = buttonElem.getAttribute('data-day');

        if (buttonElem.classList.contains('delete-button')) {
            deleteSchedule(dayOfWeek, buttonElem);
        } else if (buttonElem.innerText === 'Зберегти') {
            saveSchedule(dayOfWeek, buttonElem);
        } else if (buttonElem.innerText === 'Змінити') {
            changeSchedule(dayOfWeek, buttonElem);
        }
    }
});
