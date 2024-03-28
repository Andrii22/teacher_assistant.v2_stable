
let currentNoteId = null;
let user_id = null;

$(document).ready(function () {
    fetchAndDisplayNotes();
    user_id = '{{ user.id }}';
    $("#logout-btn").click(manualSaveNotes);
});

function fetchAndDisplayNotes() {
    $.get("/notes/get_saved_notes", function(data) {
        displaySavedNotes(data);
    });
}

function displaySavedNotes(data) {
    if (data.success) {
        if (data.notes.length === 0) {
            return;
        }
        
        $("#saved-notes-list").html(""); 

        data.notes.forEach(note => {
            let noteElem = $(`
                <div class="saved-note" data-note-id="${note.id}">
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <span>${note.timestamp}</span>
                    <button class="delete-note" onclick="deleteNote(${note.id})">Видалити</button>
                </div>
            `);

            noteElem.click(function() {
                $("#user-notes").val(note.content);
                $("#note-title").val(note.title);
                currentNoteId = note.id;
            });

            $("#saved-notes-list").append(noteElem);
        });
    } else {
        console.log("Error fetching saved notes!");
    }
}

function saveNotes() {
    const title = $("#note-title").val();
    const content = $("#user-notes").val();
    const postData = currentNoteId ? { note_id: currentNoteId, title: title, content: content } : { title: title, content: content };
    const postUrl = currentNoteId ? "/notes/update_note" : "/notes/save_notes";

    $.post(postUrl, postData, function (data) {
        if (data.success) {
            currentNoteId = null; 
            fetchAndDisplayNotes();
        } else {
            console.log("Error saving or updating notes!");
        }
    });
}

function deleteNote(noteId) {
    $.ajax({
        type: "POST",
        url: "/notes/delete_note",
        data: { note_id: noteId },
        success: function(response) {
            if (response.success) {
                $(`.saved-note[data-note-id="${noteId}"]`).remove();
            } else {
                alert("Error deleting the note!");
            }
        },
        error: function() {
            alert("An error occurred while deleting the note.");
        }
    });
}

function manualSaveNotes() {
    saveNotes();
    if ($("#logout-btn").length) {
        window.location.href = '/logout';
    }
}
$("#add-entry-form").submit(function(e) {
    e.preventDefault();
    let formDataArray = $(this).serializeArray();
    let formDataObj = {};

    formDataArray.forEach(item => {
        formDataObj[item.name] = item.value;
    });

    $.ajax({
        url: "/add_professional_development",
        method: "POST",
        data: JSON.stringify(formDataObj),
        contentType: "application/json",
        dataType: "json",
        success: function(response) {
            if(response.success) {
                let newRow = `
                    <tr>
                        <td>${formDataObj.topic}</td>
                        <td>${formDataObj.form_of_training}</td>
                        <td>${formDataObj.type_of_training}</td>
                        <td>${formDataObj.subject_of_improvement}</td>
                        <td>${formDataObj.certificate_number}</td>
                        <td>${formDataObj.hours}</td>
                        <td>${formDataObj.date}</td>
                        <td>${formDataObj.certificate}</td>
                    </tr>
                `;

                $("#professional-development-table tbody").append(newRow);
            } else {
                console.error(response.message);
            }
        }
    });
});