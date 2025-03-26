document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const fontList = document.getElementById("fontList");
  const groupTitleInput = document.getElementById("groupTitle");
  const addRowBtn = document.getElementById("addRow");
  const createGroupBtn = document.getElementById("createGroup");
  const fontGroupContainer = document.getElementById("fontGroupContainer");
  const fontGroupList = document.getElementById("fontGroupList");
  loadFonts();
  loadFontGroups();
  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
  function handleFile(file) {
    if (file && file.name.endsWith(".ttf")) {
      const fontName = file.name.replace(".ttf", "");
      const reader = new FileReader();
      reader.onload = (event) => {
        saveFont(fontName, event.target.result);
        displayFont(fontName, event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire("Error", "Only TTF files are allowed.", "error");
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
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-2">${fontName}</td>
      <td class="p-2" style="font-family: '${fontName}', sans-serif;">Example</td>
      <td class="p-2 text-red-500 cursor-pointer delete-btn">Delete</td>
    `;
    fontList.appendChild(row);
    row.querySelector(".delete-btn").addEventListener("click", () => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteFont(fontName, row);
        }
      });
    });
  }
  function deleteFont(fontName, row) {
    let fonts = JSON.parse(localStorage.getItem("uploadedFonts")) || [];
    fonts = fonts.filter((font) => font.name !== fontName);
    localStorage.setItem("uploadedFonts", JSON.stringify(fonts));
    row.remove();
  }
  addRowBtn.addEventListener("click", () => {
    const fonts = JSON.parse(localStorage.getItem("uploadedFonts")) || [];
    if (fonts.length === 0) {
      return Swal.fire(
        "Error",
        "No fonts available. Upload fonts first.",
        "error"
      );
    }
    const select = document.createElement("select");
    select.classList.add("w-full", "p-2", "border", "rounded", "mb-2");

    fonts.forEach((font) => {
      const option = document.createElement("option");
      option.value = font.name;
      option.textContent = font.name;
      select.appendChild(option);
    });

    fontGroupContainer.appendChild(select);
  });
  createGroupBtn.addEventListener("click", () => {
    const groupName = groupTitleInput.value.trim();
    if (!groupName)
      return Swal.fire("Error", "Enter a valid group name", "error");

    const selectedFonts = [...fontGroupContainer.querySelectorAll("select")]
      .map((select) => select.value)
      .filter((font) => font !== "");

    if (selectedFonts.length === 0) {
      return Swal.fire("Error", "Select at least one font", "error");
    }
    saveFontGroup(groupName, selectedFonts);
    displayFontGroup(groupName, selectedFonts);
    groupTitleInput.value = "";
    fontGroupContainer.innerHTML = "";
  });
  function saveFontGroup(groupName, fontNames) {
    let groups = JSON.parse(localStorage.getItem("fontGroups")) || [];
    groups.push({ name: groupName, fonts: fontNames });
    localStorage.setItem("fontGroups", JSON.stringify(groups));
  }
  function loadFontGroups() {
    let groups = JSON.parse(localStorage.getItem("fontGroups")) || [];
    groups.forEach((group) => displayFontGroup(group.name, group.fonts));
  }
  function displayFontGroup(groupName, fontNames) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-2">${groupName}</td>
      <td class="p-2">${fontNames.join(", ")}</td>
      <td class="p-2 text-red-500 cursor-pointer delete-group">Delete</td>
    `;
    fontGroupList.appendChild(row);
    row.querySelector(".delete-group").addEventListener("click", () => {
      Swal.fire({
        title: "Are you sure?",
        text: "This will delete the font group permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteFontGroup(groupName, row);
        }
      });
    });
  }
  function deleteFontGroup(groupName, row) {
    let groups = JSON.parse(localStorage.getItem("fontGroups")) || [];
    groups = groups.filter((group) => group.name !== groupName);
    localStorage.setItem("fontGroups", JSON.stringify(groups));
    row.remove();
  }
});
