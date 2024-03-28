
const courseCreationModal = document.getElementById('courseCreationModal');
const coursesList = document.getElementById('coursesList');
const questionsContainer = document.getElementById('questionsContainer');

function showCourseCreationForm() {
    const courseCreationModal = document.getElementById('courseCreationModal');
    courseCreationModal.style.display = 'block';
    const courseCreationBtn = document.getElementById('createCourseButton');
    courseCreationBtn.style.display = 'none';
}


function closeCourseCreationForm() {
    const courseCreationModal = document.getElementById('courseCreationModal');
    courseCreationModal.style.display = 'none';
    const courseCreationBtn = document.getElementById('createCourseButton');
    courseCreationBtn.style.display = 'block';
    clearCourseCreationForm();
}

let questionCounter = 1;


function updateQuestionsNumbering() {
    const allQuestions = document.querySelectorAll('.questionContainer');
    allQuestions.forEach((question, index) => {
        question.querySelector('label').textContent = `Питання №${index + 1}:`;
        question.dataset.questionNumber = index + 1;
    });
    questionCounter = allQuestions.length; 
}


function updateAnswersLabels(answersContainer) {
    const allAnswers = answersContainer.querySelectorAll('.answerContainer');
    const alphabet = ['а', 'б', 'в', 'г', 'д', 'е'];
    allAnswers.forEach((answer, index) => {
        answer.querySelector('label').textContent = `${alphabet[index]})`;
    });
}


function deleteQuestion(questionDiv) {
    const questionsContainer = questionDiv.parentNode;
    questionsContainer.removeChild(questionDiv);
    updateQuestionsNumbering(); 
}


function deleteAnswer(answerDiv) {
    const answersContainer = answerDiv.parentNode;
    answersContainer.removeChild(answerDiv);
    updateAnswersLabels(answersContainer); 
}

function addQuestion() {
    const questionsContainer = document.getElementById('questionsContainer'); 

    if (questionCounter > 0 && !validateLastQuestion()) {
        alert('Будь ласка, заповніть поле питання перед додаванням нового.');
        return;
    }

    const questionDiv = document.createElement('div');
    questionDiv.className = 'questionContainer';
    questionDiv.dataset.questionNumber = questionCounter + 1;
    questionDiv.innerHTML = `
        <label  style="font-size: 20px;" >Питання №${questionCounter + 1}:</label>
        <textarea class="questionTitle" required></textarea>
        <button type="button" onclick="addAnswer(this)">Додати відповідь</button>
        <div class="answersContainer"></div>
    `;

    const deleteQuestionBtn = document.createElement('button');
    deleteQuestionBtn.className = 'delete-btn';
    deleteQuestionBtn.type = 'button';
    deleteQuestionBtn.textContent = 'Видалити питання'; 
    deleteQuestionBtn.onclick = function() { deleteQuestion(questionDiv); };
    questionDiv.appendChild(deleteQuestionBtn);

    questionsContainer.appendChild(questionDiv);

    questionCounter++;
    updateQuestionsNumbering(); 
}

function addAnswer(questionButton) {
    const answersContainer = questionButton.nextElementSibling;

    if (!validateAnswersBasic(answersContainer)) {
        alert('Будь ласка, заповніть усі поля відповідей перед додаванням нової.');
        return;
    }

    const existingAnswers = answersContainer.getElementsByClassName('answerInput').length;
    const maxAnswers = 6;
    const alphabet = ['а', 'б', 'в', 'г', 'д', 'е'];

    if (existingAnswers >= maxAnswers) {
        alert('Не можна додати більше 6 відповідей на одне питання.');
        return;
    }

    const answerDiv = document.createElement('div');
    answerDiv.className = 'answerContainer';
    answerDiv.innerHTML = `
        <label style="font-size: 20px;">${alphabet[existingAnswers]})</label>
        <textarea class="answerInput" required></textarea>
        <label style="font-size: 20px;">Бали:</label>
        <input type="number" class="pointsInput" min="0" value="0" required>
    `;

    const deleteAnswerBtn = document.createElement('button');
    deleteAnswerBtn.className = 'delete-btn_qa';
    deleteAnswerBtn.type = 'button';
    deleteAnswerBtn.onclick = function() { deleteAnswer(answerDiv); };
    answerDiv.appendChild(deleteAnswerBtn);

    answersContainer.appendChild(answerDiv);
}
function validateLastQuestion() {
    const lastQuestionContainer = document.querySelector('.questionContainer:last-child');
    if (lastQuestionContainer) {
        const title = lastQuestionContainer.querySelector('.questionTitle').value.trim();
        return title !== '';
    }
    return true; 
}
function validateAnswersBasic(answersContainer) {
    const answers = answersContainer.getElementsByClassName('answerInput');
    for (const answer of answers) {
        if (answer.value.trim() === '') {
            return false; 
        }
    }
    return true; 
}
function submitNewCourse() {
    const newCourseName = document.getElementById('newCourseName').value;
    const courseActiveCheckbox = document.getElementById('courseActiveCheckbox').checked;
    const courseTimeLimit = document.getElementById('courseTimeLimit').value;
    const courseAttemptLimit = document.getElementById('courseAttemptLimit').value;
    const questionElements = document.getElementsByClassName('questionContainer');

    if (!newCourseName.trim()) {
        alert('Будь ласка, введіть назву курсу.');
        return;
    }

    let questionsData = [];
    let isDataValid = true;
    let hasAtLeastOnePositiveScore = false;

    for (let questionElement of questionElements) {
        const questionText = questionElement.querySelector('.questionTitle').value.trim();

        if (questionText === '') {
            alert('Будь ласка, заповніть усі поля питання.');
            isDataValid = false;
            break;
        }

        const answerContainers = questionElement.querySelectorAll('.answerContainer');
        let answersData = [];
        let questionHasPositiveScore = false;

        for (let answerContainer of answerContainers) {
            const answerText = answerContainer.querySelector('.answerInput').value.trim();
            const score = parseInt(answerContainer.querySelector('.pointsInput').value, 10) || 0;

            if (answerText === '') {
                alert('Будь ласка, заповніть усі поля відповідей.');
                isDataValid = false;
                break;
            }

            if (score > 0) {
                questionHasPositiveScore = true;
                hasAtLeastOnePositiveScore = true;
            }

            answersData.push({
                text: answerText,
                score: score
            });
        }

        if (!questionHasPositiveScore) {
            alert('Кожне питання має мати принаймні одну відповідь із балом більше 0.');
            isDataValid = false;
            break;
        }

        if (isDataValid) {
            questionsData.push({
                text: questionText,
                answers: answersData
            });
        } else {
            break;
        }
    }

    if (!isDataValid || !hasAtLeastOnePositiveScore) {
        return; 
    }
    const timeLimit = courseTimeLimit > 0 ? parseInt(courseTimeLimit, 10) : null;
    const attemptLimit = parseInt(courseAttemptLimit, 10) || 1; 
    const courseData = {
        title: newCourseName,
        is_active: courseActiveCheckbox,
        time_limit: timeLimit,
        attempt_limit: attemptLimit,
        questions: questionsData
    };
    fetch('/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log('Course created:', data);
            closeCourseCreationForm();
            loadAndDisplayCourses(); 
            clearCourseCreationForm();
        } else {
            console.error('Error creating course:', data.error);
        }
    })
    .catch(error => console.error('Error creating course:', error));
}


function loadAndDisplayCourses() {
    const coursesList = document.getElementById('coursesList'); 
    fetch('/courseslist')
        .then(response => response.json())
        .then(data => {
            if (data.courses) {
                coursesList.innerHTML = '';
                data.courses.forEach(course => {
                    const courseDiv = document.createElement('div');
                    courseDiv.className = 'course-item modal-content';
                    const statusText = course.is_active ? '<span style="color:#007bff;">Активний</span>' : '<span style="color:#007bff;">Неактивний</span>';
                    const timeLimitText = course.time_limit ? ` <span style="color:#007bff;">${course.time_limit}</span> хв` : 'Немає';
                    const attemptsText = `Кількість спроб: <span style="color:#007bff;">${course.attempt_limit}</span>`;
                    
                    courseDiv.innerHTML = `
                        <div>
                            <h3 class="course-title">${course.title}</h3>
                            <p class="course-info">Статус: ${statusText}</p>
                            <p class="course-info">Обмеження по часу:${timeLimitText}</p>
                            <p class="course-info" > ${attemptsText}</p>
                            <p class="course-info" >Кількість питань: <span style="color:#007bff;"> ${course.questions.length}</span></p>
                        </div>
                        <div class="modal-footer course-actions">
                            <button class="button edit-btn" onclick="openSeeModal(${course.id})">Переглянути</button>
                            <button class="button delete-btn" onclick="deleteCourse(${course.id})">Видалити</button>
                        </div>
                    `;
                    coursesList.appendChild(courseDiv);
                });
            } else {
                console.error('Error loading courses:', data.error);
            }
        })
        .catch(error => console.error('Error loading courses:', error));
}
function deleteCourse(courseId) {
    if (confirm('Ви впевнені, що хочете видалити цей курс?')) {
        fetch(`/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Проблема при видаленні курсу.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Курс видалено:', data);
            loadAndDisplayCourses(); 
        })
        .catch(error => console.error('Помилка при видаленні курсу:', error));
    }
}
function clearCourseCreationForm() {
    document.getElementById('newCourseName').value = ''; 
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    questionCounter = 1;
}
function openSeeModal(courseId) {

    fetch(`/courses/${courseId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(courseData => {
        console.log(courseData)
        document.getElementById('modalCourseTitle').textContent = courseData.title;
        
        const activeCheckboxLabel = document.createElement('label');
        activeCheckboxLabel.textContent = 'Активний курс:';
        activeCheckboxLabel.style.fontSize = '20px';
        
        const activeCheckbox = document.createElement('input');
        activeCheckbox.type = 'checkbox';
        activeCheckbox.checked = courseData.is_active;
        activeCheckbox.onchange = () => toggleCourseStatus(courseId);
        const checkboxContainer = document.createElement('div');
        checkboxContainer.appendChild(activeCheckboxLabel);
        checkboxContainer.appendChild(activeCheckbox);
        
        const questionsListElement = document.getElementById('modalQuestionsList');
        questionsListElement.innerHTML = '';
        courseData.questions.forEach((question, questionIndex) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'questionItem';
            questionElement.textContent = `Питання №${questionIndex + 1}: ${question.text}`;
            questionsListElement.appendChild(checkboxContainer);
          
            const answersList = document.createElement('ul');
            question.answers.forEach((answer, answerIndex) => {
              const alphabet = 'абвгдежзийклмнопрстуфхцчшщьюя'; 
              const answerElement = document.createElement('li');
              answerElement.className = 'answerItem';
              answerElement.textContent = `${alphabet[answerIndex]}) ${answer.text} - Бали: ${answer.score}`;
              answersList.appendChild(answerElement);
            });
          
            questionsListElement.appendChild(questionElement);
            questionsListElement.appendChild(answersList);
          });
  
        document.getElementById('seeModal').style.display = 'block';
      })
      .catch(error => {
        console.error('Could not fetch the course:', error);
      });
  }
  
  function closeSeeModal() {
    document.getElementById('seeModal').style.display = 'none';
  }

  function toggleCourseStatus(courseId) {
    if (!courseId) {
        console.error('Course ID is missing.');
        return;
    }

    fetch(`/courses/${courseId}/toggle-status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message); 
        loadAndDisplayCourses();
    })
    .catch(error => {
        console.error('Error toggling course status:', error);
    });
}




loadAndDisplayCourses();