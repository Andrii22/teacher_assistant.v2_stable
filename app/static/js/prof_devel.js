$(document).ready(function () {
    $.ajax({
        url: "/get_all_entries",
        method: "GET",
        dataType: "json",
        success: function (entries) {
            entries.forEach(function (entry) {
                const newRow = `
                    <tr data-id="${entry.id}">
                        <td>${entry.topic}</td>
                        <td>${entry.form_of_training}</td>
                        <td>${entry.type_of_training}</td>
                        <td>${entry.subject_of_improvement}</td>
                        <td>${entry.certificate_number}</td>
                        <td>${entry.hours}</td>
                        <td>${entry.date}</td>
                        <td>${entry.certificate}</td>
                        <td><button class="edit-button">Змінити</button></td>
                    </tr>
                `;
                $(newRow).insertBefore("#input-row");
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error fetching entries:", textStatus, errorThrown);
        }
    });

    $("#save-new-button").click(function () {
        let formDataObj = {};
        let allFilled = true;
    
        $("#input-row .input-cell").each(function () {
            if(!$(this).val()) {
                allFilled = false;
                return false;  
            }
            formDataObj[$(this).attr("name")] = $(this).val();
        });
    
        if(!allFilled) {
            alert("Заповніть всі необхідні поля таблиці!");
            return;
        }
        $.ajax({
            url: "/add_professional_development",
            method: "POST",
            data: JSON.stringify(formDataObj),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    const newRow = `
                        <tr>
                            <td>${formDataObj.topic}</td>
                            <td>${formDataObj.form_of_training}</td>
                            <td>${formDataObj.type_of_training}</td>
                            <td>${formDataObj.subject_of_improvement}</td>
                            <td>${formDataObj.certificate_number}</td>
                            <td>${formDataObj.hours}</td>
                            <td>${formDataObj.date}</td>
                            <td>${formDataObj.certificate}</td>
                            <td><button class="edit-button">Змінити</button></td>
                        </tr>
                    `;
                    $(newRow).insertBefore("#input-row");
                    $("#input-row .input-cell").val(''); s
                } else {
                    console.error("Error saving entry:", response.message);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("AJAX Error:", textStatus, errorThrown);
            }
        });
    });

    const nameMapping = {
        0: "topic",
        1: "form_of_training",
        2: "type_of_training",
        3: "subject_of_improvement",
        4: "certificate_number",
        5: "hours",
        6: "date",
        7: "certificate"
    };
    
    $(document).on("click", ".edit-button", function () {
        const row = $(this).closest("tr");
        row.find("td:not(:last)").each(function () {
            const val = $(this).text();
            const name = nameMapping[$(this).index()];  
            $(this).html(`<input type="text" class="input-cell" name="${name}" value="${val}">`);
        });
        $(this).text("Зберегти").removeClass("edit-button").addClass("save-edit-button");
    });

    $(document).on("click", ".save-edit-button", function () {
        const row = $(this).closest("tr");
        const id = row.attr("data-id");
        let formDataObj = {};
        row.find(".input-cell").each(function () {
            const inputName = $(this).attr("name");
            formDataObj[inputName] = $(this).val();
        });
        $.ajax({
            url: `/update_professional_development/${id}`,
            method: "POST",
            data: JSON.stringify(formDataObj),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    row.find(".input-cell").each(function () {
                        const val = $(this).val();
                        $(this).parent().text(val);
                    });
                    row.find(".save-edit-button").text("Змінити").removeClass("save-edit-button").addClass("edit-button");
                } else {
                    console.error(response.message);
                }
            }
        });
    });
});