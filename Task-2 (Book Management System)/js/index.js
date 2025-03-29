document.addEventListener("DOMContentLoaded", function () {
  const bookContainer = document.getElementById("book-container");
  const searchInput = document.getElementById("search-input");
  const genreFilter = document.getElementById("genre-filter");
  let booksData = [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  async function fetchBooks() {
    try {
      const response = await fetch("https://gutendex.com/books");
      const data = await response.json();
      booksData = data.results;
      renderBooks(booksData);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  function renderBooks(books) {
    bookContainer.innerHTML = "";
    books.forEach((book) => {
      const isWishlisted = wishlist.includes(book.id);
      const bookCard = document.createElement("div");
      bookCard.className =
        "bg-white p-4 rounded shadow-md text-center flex flex-col items-center";
      bookCard.innerHTML = `
        <img src="${book.formats["image/jpeg"]}" alt="${
        book.title
      }" class="w-full h-48 object-cover mb-4 rounded">
        <h3 class="text-lg font-semibold mb-2">${book.title}</h3>
        <p class="text-gray-600 mb-4">${book.authors
          .map((a) => a.name)
          .join(", ")}</p>
        <button class="wishlist-btn mt-auto w-full px-4 py-2 rounded transition-all duration-300 ${
          isWishlisted
            ? "bg-red-500 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }" data-id="${book.id}">
          ${isWishlisted ? "Remove from Wishlist 👎" : "Add to Wishlist 👍"}
        </button>
      `;
      bookContainer.appendChild(bookCard);
    });
    attachWishlistListeners();
  }

  function attachWishlistListeners() {
    document.querySelectorAll(".wishlist-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const bookId = parseInt(this.getAttribute("data-id"));
        toggleWishlist(bookId, this);
      });
    });
  }
  function toggleWishlist(bookId, button) {
    if (wishlist.includes(bookId)) {
      wishlist = wishlist.filter((id) => id !== bookId);
      button.classList.remove("bg-red-500", "text-white");
      button.classList.add("bg-gray-200", "hover:bg-gray-300");
      button.textContent = "Add to Wishlist 👍";
    } else {
      wishlist.push(bookId);
      button.classList.add("bg-red-500", "text-white");
      button.classList.remove("bg-gray-200", "hover:bg-gray-300");
      button.textContent = "Remove from Wishlist 👎";
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = booksData.filter((book) =>
      book.title.toLowerCase().includes(searchTerm)
    );
    renderBooks(filteredBooks);
  });

  fetchBooks();
});
