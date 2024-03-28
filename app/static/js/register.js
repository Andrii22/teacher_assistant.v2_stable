document.addEventListener("DOMContentLoaded", function() {
    const userImage = document.getElementById("user-image");
    const profilePhotoInput = document.getElementById("profile_photo");

    document.getElementById("image-overlay").addEventListener("click", function() {
        profilePhotoInput.click();
    });

    profilePhotoInput.addEventListener("change", function() {
        const selectedFile = profilePhotoInput.files[0];
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            userImage.src = url;
        }
    });
});