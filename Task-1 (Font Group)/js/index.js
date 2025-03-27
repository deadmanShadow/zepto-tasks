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
    const fontStyle = document.createElement("style");
    fontStyle.innerHTML = `
        @font-face {
            font-family: '${fontName}';
            src: url('${fontData}') format('truetype');
        }
    `;

    document.head.appendChild(fontStyle);

    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="p-3 border">${fontName}</td>
        <td class="p-3 border" style="font-family: '${fontName}', sans-serif;">Example Style</td>
        <td class="p-3 border text-red-500 cursor-pointer delete-btn">Delete</td>
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
          Swal.fire({
            title: "Deleted!",
            text: "Your font has been deleted successfully.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
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

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3 border"><input type="text" class="w-full p-2 border rounded" placeholder="Font Name" /></td>
      <td class="p-3 border">
        <select class="w-full p-2 border rounded">
          ${fonts
            .map((font) => `<option value="${font.name}">${font.name}</option>`)
            .join("")}
        </select>
      </td>
      <td class="p-3 border">
        <select class="w-full p-2 border rounded">
          <option value="1.00">1.00</option>
          <option value="1.25">1.25</option>
          <option value="1.50">1.50</option>
        </select>
      </td>
      <td class="p-3 border">
        <select class="w-full p-2 border rounded">
          <option value="0">0</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
      </td>
      <td class="p-3 border text-red-500 cursor-pointer remove-row">Delete</td>
    `;
    fontGroupContainer.appendChild(row);
    row
      .querySelector(".remove-row")
      .addEventListener("click", () => row.remove());
  });

  createGroupBtn.addEventListener("click", () => {
    const groupName = groupTitleInput.value.trim();
    if (!groupName)
      return Swal.fire("Error", "Enter a valid group name", "error");
    const selectedFonts = [...fontGroupContainer.querySelectorAll("tr")]
      .map((row) => row.querySelector("select").value)
      .filter((font) => font !== "");
    if (selectedFonts.length < 2) {
      return Swal.fire("Error", "select at least two fonts", "error");
    }
    saveFontGroup(groupName, selectedFonts);
    displayFontGroup(groupName, selectedFonts);
    groupTitleInput.value = "";
    fontGroupContainer.innerHTML = "";
  });

  //save the font group
  function saveFontGroup(groupName, fontNames) {
    let groups = JSON.parse(localStorage.getItem("fontGroups")) || [];
    groups.push({ name: groupName, fonts: fontNames });
    localStorage.setItem("fontGroups", JSON.stringify(groups));
  }

  //load the font group
  function loadFontGroups() {
    let groups = JSON.parse(localStorage.getItem("fontGroups")) || [];
    groups.forEach((group) => displayFontGroup(group.name, group.fonts));
  }

  //display the font group
  function displayFontGroup(groupName, fontNames) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3 border">${groupName}</td>
      <td class="p-3 border">${fontNames.join(", ")}</td>
      <td class="p-3 border">${fontNames.length}</td>
      <td class="p-3 border text-red-500 cursor-pointer delete-group">Delete</td>
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
          Swal.fire({
            title: "Deleted!",
            text: "Your font group has been deleted successfully.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
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
