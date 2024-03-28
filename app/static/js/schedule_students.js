


function fetchAndDisplayStudentSchedule() {
    const scheduleContainer = document.getElementById('schedule-students');
    const classNumber = userClass;
    const classLetter = userSubclass;
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
                
                if(existingSchedules.length === 0) {
                    const noDataText = document.createElement('p');
                    noDataText.innerText = "Розкладу на цей день немає.";
                    scheduleContainer.appendChild(noDataText);
                    return;
                }

                const dayTable = document.createElement('table');
                const dayTableHeader = `
        <thead>
            <tr>
                <th>Час</th>
                <th>Опис</th>
            </tr>
        </thead>
    `;
                dayTable.innerHTML = dayTableHeader;
                const tbody = document.createElement('tbody');

                existingSchedules.forEach(schedule => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${schedule.lesson_time}</td>
                        <td>${schedule.description || ''}</td>
                    `;
                    tbody.appendChild(tr);
                });

                dayTable.appendChild(tbody);
                scheduleContainer.appendChild(dayTable);
            });
        })
        .catch(error => {
            console.error('Fetch error when displaying student schedule:', error);
        });
}

