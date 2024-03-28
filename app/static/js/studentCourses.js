document.addEventListener('DOMContentLoaded', function() {
    loadCoursesForStudent();
  });
  function getUserId() {
    const userIdElement = document.getElementById('userId');
    return userIdElement ? userIdElement.value : null;
  }
  let timerInterval = null;


  function loadCoursesForStudent() {
    const userId = getUserId(); 
    const coursesList = document.getElementById('coursesList');
    const coursesheader = document.getElementById('content-courses-header');
    fetch(`/student/${userId}/courses-results`)
        .then(response => response.json())
        .then(studentCoursesResults => {
            const attemptsLeftByCourseId = studentCoursesResults.reduce((acc, course) => {
                acc[course.course_id] = course.attempts_left;
                return acc;
            }, {});
            fetch('/courseslist')
                .then(response => response.json())
                .then(data => {
                    if (data.courses && Array.isArray(data.courses)) {
                        coursesList.innerHTML = '';
                        coursesheader.style.display = 'none';
                        data.courses.forEach(course => {
                            if (!course.is_active) {
                                return;
                            }
                            const timeLimitText = course.time_limit ? `<span style="color:#007bff;">${course.time_limit}</span> хв` : 'Без обмеження';
                            let attemptsText;
                            if (course.id in attemptsLeftByCourseId) {
                                attemptsText = ` ${attemptsLeftByCourseId[course.id]}</span>`;
                            } else {
                                attemptsText = ` ${course.attempt_limit}`;
                            }

                            const courseDiv = document.createElement('div');
                            courseDiv.className = 'course-item modal-content'; 
                            courseDiv.innerHTML = `
                                <div>
                                    <h3 class="course-title">${course.title}</h3>
                                    <p class="course-info">Кількість питань:<span style="color:#007bff;"> ${course.questions.length}</span></p>
                                    <p class="course-info">Обмеження за часом: ${timeLimitText} </p>
                                    <p class="course-info">Кількість спроб: <span style="color:#007bff;">${attemptsText}</span></p>
                                </div>
                                <div class="modal-footer course-actions">
                                    <button class="button take-course-btn" onclick="startCourse(${course.id})">Пройти курс</button>
                                </div>
                            `;
                            coursesList.appendChild(courseDiv);
                        });
                    } else {
                        coursesheader.style.display = 'block';
                    }
                })
                .catch(error => console.error('Error loading courses:', error));
        })
        .catch(error => console.error('Error getting student courses results:', error));
}
function displayNoCoursesMessage() {
}
function startCourse(courseId) {
    const userId = getUserId();
    if (!userId) {
        console.error('User ID is not found');
        return;
    }

    fetch(`/student/${userId}/course/${courseId}/access-course`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            alert('У вас не залишилося спроб для проходження цього курсу.');
        }
        return response.json();
    })
    .then(data => {
        if (data.attempts_left > 0) {
            openCourseModal(courseId, userId);
        } else if (data.attempts_left <= 0){
            alert('У вас не залишилося спроб для проходження цього курсу.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

  function openCourseModal(courseId) {
    fetch(`/courses/${courseId}`)
        .then(response => response.json())
        .then(courseData => {
            console.log({ courseData });
            const correctAnswerIndexes = courseData.questions.map(question => {
                if (!question.answers || question.answers.length === 0) {
                    console.error('No answers for question:', question);
                    return -1; 
                }
                const correctAnswerIndex = question.answers.findIndex(answer => answer.score > 0);
                return correctAnswerIndex >= 0 ? correctAnswerIndex : -1;
            });

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.setAttribute('data-course-id', courseId); 
            modal.correctAnswerIndexes = correctAnswerIndexes; 
            modal.innerHTML = `
            <div class="modal-content">
                <h2 id="courseModalTitle">${courseData.title}</h2>
                <div id="timerDisplay" class="timer"></div>
                <div id="modalQuestionsList">
                    <form id="courseForm">
                        ${courseData.questions.map((question, index) => `
                            <div class="questionItem">
                                <p class="questionText">Питання №${index + 1}: ${question.text}</p>
                                ${question.answers.map((answer, answerIndex) => `
                                    <label class="answerItem">
                                        <input type="radio" name="question${index}" value="${answerIndex}">
                                        ${String.fromCharCode('а'.charCodeAt(0) + answerIndex)}) ${answer.text}
                                    </label>
                                `).join('')}
                            </div>
                        `).join('')}
                        <button type="submit" class="submit-btn-course">Завершити курс</button>
                        <div id="testResult" style="display: none;"></div>
                        <button type="button" class="close-course-btn" style="display: none;" onclick="closeCourseModal(this, '${courseId}')">Закрити</button>
                    </form>
                </div>
            </div>
        `;
            document.body.appendChild(modal);

            const form = document.getElementById('courseForm');
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                submitAnswers(form, correctAnswerIndexes, userId, courseId);
            });

            modal.style.display = 'block';

            if (courseData.time_limit) {
                startTimer(courseData.time_limit, document.getElementById('courseForm'), correctAnswerIndexes);
            }
        })
        .catch(error => {
            console.error('Could not load the course:', error);
        });
}
function startTimer(timeLimit, form, correctAnswerIndexes) {
    if (!timeLimit || timeLimit <= 0) {
        return;
    }
    
    let time = timeLimit * 60; 
    const timerDisplay = document.getElementById('timerDisplay'); 
    timerDisplay.style.display = 'block'; 

    timerInterval = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
    
        timerDisplay.innerHTML = `Залишилось часу: <span style="color:#007bff;">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</span>`;
        time -= 1;

        if (time < 0) {
            clearInterval(timerInterval);
            timerDisplay.innerHTML = 'Час вийшов!';
            submitAnswers(form, correctAnswerIndexes); 
        }
    }, 1000);

    form.addEventListener('submit', function () {
        clearInterval(timerInterval); 
    });
}
function submitAnswers(form, correctAnswerIndexes, userId, courseId) {
    const userAnswers = getUserAnswers(form, correctAnswerIndexes.length);
    let correctAnswersCount = 0;

    userAnswers.forEach((answerIndex, index) => {
        if (answerIndex != -1 && parseInt(answerIndex) === correctAnswerIndexes[index]) {
            correctAnswersCount++;
        }
    });

    const score = (correctAnswersCount / correctAnswerIndexes.length) * 100;
    displayResults(correctAnswersCount, correctAnswerIndexes.length, score);
    submitCourseResult(userId, courseId, score); 

    const closeButton = document.querySelector('.close-course-btn'); 
    if (closeButton) {
        closeButton.style.display = 'block'; 
    }
}
function getUserAnswers(form, totalQuestions) {
    let answers = [];
    for (let i = 0; i < totalQuestions; i++) {
        const radios = form[`question${i}`];
        let userAnswer = -1;
        if (radios.length) {
            const selectedRadio = Array.from(radios).find(radio => radio.checked);
            userAnswer = selectedRadio ? selectedRadio.value : -1;
        } else {
            userAnswer = radios.checked ? radios.value : -1;
        }
        answers.push(parseInt(userAnswer));
    }
    return answers;
}

function displayResults(correctAnswersCount, totalQuestions, score) {
    let resultText;
    switch (true) {
        case (score >= 85):
            resultText = '5 (Відмінно)';
            break;
        case (score >= 65):
            resultText = '4 (Добре)';
            break;
        case (score >= 50):
            resultText = '3 (Задовільно)';
            break;
        case (score >= 35):
            resultText = '2 (Погано)';
            break;
        default:
            resultText = 'Не пройдено';
    }

    const resultElement = document.getElementById('testResult');
    resultElement.style.display = 'block';
    resultElement.style.fontSize = '1.5em';
    resultElement.innerHTML = `Результат: <span style="color: #007bff">${resultText}</span>, правильних відповідей: <span style="color: #007bff">${correctAnswersCount}</span> з ${totalQuestions}`;

    const submitButton = document.querySelector('.submit-btn-course');
    if (submitButton) {
        submitButton.style.display = 'none';
    }
    console.log(score)
}
function submitCourseResult(userId, courseId, score) {
    let newScore = 0
    switch (true) {
        case (score >= 85):
            newScore = 5 
            break;
        case (score >= 65):
            newScore = 4
            break;
        case (score >= 50):
            newScore = 3
            break;
        case (score >= 35):
            newScore = 2
            break;
        default:
            newScore = 0
    }
    fetch(`/student/${userId}/course/${courseId}/submit-result`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade: newScore })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            console.log('Course result submitted:', data.message);
        }
    })
    .catch(error => {
        console.error('Error submitting course result:', error);
    });
}
function closeCourseModal(buttonElement, courseId) {
    const modal = buttonElement.closest('.modal');
    const form = modal.querySelector('#courseForm');
    const correctAnswerIndexes = modal.correctAnswerIndexes;
    const userId = getUserId();

    if (form && correctAnswerIndexes && userId) {
        submitAnswers(form, correctAnswerIndexes, userId, courseId);
    }

    modal.style.display = 'none';
    modal.remove();
    loadCoursesForStudent()
}
