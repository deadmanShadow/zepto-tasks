document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const fontList = document.getElementById("fontList");
  // load from localstorage
  loadFonts();
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("border-blue-500");
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("border-blue-500");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-blue-500");
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });
  function handleFile(file) {
    if (file && file.name.endsWith(".ttf")) {
      const fontName = file.name.replace(".ttf", "");
      const reader = new FileReader();

      reader.onload = function (event) {
        const fontData = event.target.result;
        saveFont(fontName, fontData);
        displayFont(fontName, fontData);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Only TTF files are allowed.");
    }
  }
  function saveFont(fontName, fontData) {
    let fonts = JSON.parse(localStorage.getItem("uploadedFonts")) || [];
    fonts.push({ name: fontName, data: fontData });
    localStorage.setItem("uploadedFonts", JSON.stringify(fonts));
  }
  function loadFonts() {
    let fonts = JSON.parse(localStorage.getItem("uploadedFonts")) || [];
    fonts.forEach((font) => displayFont(font.name, font.data));
  }
  function displayFont(fontName, fontData) {
    const newFont = new FontFace(fontName, `url(${fontData})`);
    newFont.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      const row = document.createElement("tr");
      row.classList.add("border-b");
      row.innerHTML = `
                <td class="p-2">${fontName}</td>
                <td class="p-2" style="font-family: '${fontName}', sans-serif;">Example Style</td>
                <td class="p-2 text-red-500 cursor-pointer delete-btn" data-font="${fontName}">Delete</td>
            `;
      fontList.appendChild(row);
      row.querySelector(".delete-btn").addEventListener("click", (e) => {
        const fontToDelete = e.target.getAttribute("data-font");
        deleteFont(fontToDelete);
        row.remove();
      });
    });
  }
  function deleteFont(fontName) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${fontName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        //rmove from storage
        let fonts = JSON.parse(localStorage.getItem("uploadedFonts")) || [];
        fonts = fonts.filter((font) => font.name !== fontName);
        localStorage.setItem("uploadedFonts", JSON.stringify(fonts));
        //remove from ui
        document.querySelectorAll(`[data-font="${fontName}"]`).forEach((el) => {
          el.closest("tr").remove();
        });
        //for fancy
        Swal.fire({
          title: "Deleted!",
          text: `"${fontName}" has been removed.`,
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    });
  }
});
