



document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#class-number-select').addEventListener('change', updateTable);
    document.querySelector('#class-letter-select').addEventListener('change', updateTable);
    document.querySelector('#trimester-select').addEventListener('change', updateTable);
    updateTable() 
});

function updateTable() {
    const classNumber = document.getElementById('class-number-select').value;
    const classLetter = document.getElementById('class-letter-select').value;
    const monthOrTrimester = document.getElementById('trimester-select').value;
    fetch(`/get-attendance-data?class_number=${classNumber}&class_letter=${classLetter}&month_or_trimester=${monthOrTrimester}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);
            createAttendanceTable(data);

        })
        .catch(error => console.error('Error fetching attendance data:', error));
}

function createAttendanceTable(data) {
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
    if (data.dates && data.dates.length) {
        monthTrimesterHeaderCell.colSpan = data.dates.length;
    }

    const courseHeaderCell = headerRow.insertCell();
    courseHeaderCell.innerText = 'Курси';
    courseHeaderCell.colSpan = Array.isArray(data.courses) ? data.courses.length : 1;

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
            const dateCell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'attendance-input';
            const studentGrades = data.grades_data[student.student_id];
            if (studentGrades && studentGrades[date]) { 
                input.value = studentGrades[date];
            } else {
                input.value = '';
            }
            input.dataset.date = date;
            input.dataset.originalValue = input.value;
            input.addEventListener('blur', function() {
                if (this.value !== this.dataset.originalValue) {
                    if (this.value.trim() !== '') {
                        updateGrade(student.student_id, this.dataset.date, this.value, this);
                    }
                    this.dataset.originalValue = this.value;
                }
            });
            
            dateCell.appendChild(input);
        });

        data.courses.forEach(course => {
            const gradeCell = row.insertCell();
            const studentGrades = data.student_grades[student.student_id];
            const grade = studentGrades && studentGrades[course.course_id] ? studentGrades[course.course_id] : '0'; 
            console.log(`Course grade for ${student.student_id}, course ${course.course_id}:`, grade);
            gradeCell.innerText = grade;
        });
    });

    tableContainer.appendChild(table);
}

function calculateAbsences(attendanceRecords) {
    let absences = 0;
    for (let date in attendanceRecords) {
        if (attendanceRecords[date] === 'н') {
            absences++;
        }
    }
    return absences;
}
function calculateAverageGrade(studentGrades) {
    let total = 0;
    let count = 0;
    for (let courseId in studentGrades) {
        let grade = studentGrades[courseId];
        if (!isNaN(grade)) {
            total += parseInt(grade, 10);
            count++; 
        }
    }
    return count > 0 ? total / count : 0;
}
function updateGrade(studentId, date, grade, cellElement) {
    const classNumber = document.getElementById('class-number-select').value;
    const classLetter = document.getElementById('class-letter-select').value;
    const monthOrTrimester = document.getElementById('trimester-select').value;
    const validGradePattern = /^([1-5Н])?$/;
    if (!validGradePattern.test(grade)) {
        alert("Введіть оцінку від 1 до 5 або букву  'Н'.");
        return;
    }
    fetch('/update-grades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentId,
            date,
            grade,
            classNumber,
            classLetter,
            monthOrTrimester
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Проблема із збереженням оцінки');
        }
        return response.json();
    })
    .then(data => {
        console.log('Grade updated:', data, date);
    })
    .catch(error => {
        console.error('Error updating grade:', error);
        alert('Сталася помилка при оновленні оцінки.');
    });
}


function loadGrades() {
    const classNumber = document.getElementById('class-number-select').value;
    const classLetter = document.getElementById('class-letter-select').value;
    const monthOrTrimester = document.getElementById('trimester-select').value;

    fetch(`/get-grades?class_number=${classNumber}&class_letter=${classLetter}&month_or_trimester=${monthOrTrimester}`)
        .then(response => response.json())
        .then(data => {
            createAttendanceTable(data);
            console.log("ALO",data)
        })
        .catch(error => console.error('Error loading grades:', error));
}
function formatUkrainianDate(dateString) {
    const days = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    const dateParts = dateString.split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayName = days[date.getDay()];
    return `${dateParts[2].padStart(2, '0')}\\${dayName}`;
}

