var userClass = "{{ user.user_class }}";
var userSubclass = "{{ user.user_subclass }}";

document.addEventListener('DOMContentLoaded', function() {
    const trimesterSelect = document.getElementById('trimester-select');
    trimesterSelect.addEventListener('change', () => loadClassGrades(userClass, userSubclass));
    loadClassGrades(userClass, userSubclass);
});

function loadClassGrades(classNumber, classLetter) {
    const monthOrTrimester = document.getElementById('trimester-select').value;
    const url = `/get-class-attendance-data?class_number=${classNumber}&class_letter=${classLetter}&month_or_trimester=${monthOrTrimester}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            createReadOnlyAttendanceTable(data);
        })
        .catch(error => {
            console.error('Error loading grades:', error);
            alert('Не вдалося завантажити дані. Будь ласка, перевірте своє інтернет-з\'єднання або спробуйте пізніше.');
        });
}


function createReadOnlyAttendanceTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'attendance-table';

    const headerRow = table.insertRow();
    const studentHeaderCell = headerRow.insertCell();
    studentHeaderCell.innerText = 'Учень';
    studentHeaderCell.rowSpan = 2;

    const monthTrimesterHeaderCell = headerRow.insertCell();
    monthTrimesterHeaderCell.innerText = data.month_and_trimester;
    monthTrimesterHeaderCell.colSpan = data.dates.length;

    const courseHeaderCell = headerRow.insertCell();
    courseHeaderCell.innerText = 'Курси';
    courseHeaderCell.colSpan = data.courses.length;

    const datesRow = table.insertRow();
    data.dates.forEach(dateString => {
        const dateCell = datesRow.insertCell();
        const formattedDate = formatUkrainianDate(dateString); 
        const [day, weekday] = formattedDate.split('\\');
        

        const dayDiv = document.createElement('div');
        dayDiv.innerText = day;
        dayDiv.className = 'date-day';
    
        const weekdayDiv = document.createElement('div');
        weekdayDiv.innerText = weekday;
        weekdayDiv.className = 'date-weekday';

        dateCell.appendChild(dayDiv);
        dateCell.appendChild(weekdayDiv);
    });
    data.students.forEach(student => {
        const row = table.insertRow();
        const nameCell = row.insertCell();
        nameCell.innerText = student.student_name;
        data.dates.forEach(date => {
            const gradeCell = row.insertCell();
            const grade = data.grades_data[student.student_id][date] || ''; 
            gradeCell.innerText = grade;
        });
        data.courses.forEach(course => {
            const courseGradeCell = row.insertCell();
            const studentId = student.student_id;
            const courseId = course.course_id;
            const courseGrade = data.student_grades[studentId] && data.student_grades[studentId][courseId] ? data.student_grades[studentId][courseId] : 'Немає оцінки';
            courseGradeCell.innerText = courseGrade;
          });
    });

    tableContainer.appendChild(table); 
}
function formatUkrainianDate(dateString) {
    const days = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    const dateParts = dateString.split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayName = days[date.getDay()];
    return `${dateParts[2].padStart(2, '0')}\\${dayName}`;
}

