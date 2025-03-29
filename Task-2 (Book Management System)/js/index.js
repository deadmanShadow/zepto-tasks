document.addEventListener("DOMContentLoaded", function () {
  const bookContainer = document.getElementById("book-container");
  const searchInput = document.getElementById("search-input");
  const genreFilter = document.getElementById("genre-filter");
  const paginationContainer = document.getElementById("pagination-container");
  const wishlistCount = document.getElementById("wishlist-count");
  const wishlistCountMobile = document.getElementById("wishlist-count-mobile");

  let booksData = [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let currentPage = 1;
  const booksPerPage = 8;
  let searchTerm = localStorage.getItem("searchTerm") || "";
  let selectedGenre = "";

  async function fetchBooks() {
    try {
      const response = await fetch("https://gutendex.com/books");
      const data = await response.json();
      booksData = data.results;
      loadGenres();
      renderBooks(booksData);

      if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
      }

      if (genreFilter) {
        genreFilter.addEventListener("change", handleGenreFilter);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  function loadGenres() {
    const genres = new Set();
    booksData.forEach((book) => {
      if (book.subjects) {
        book.subjects.forEach((subject) => genres.add(subject));
      }
    });

    genreFilter.innerHTML = `<option value="">All Genres</option>`;
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      genreFilter.appendChild(option);
    });
  }

  function handleSearch() {
    searchTerm = searchInput.value.toLowerCase();
    localStorage.setItem("searchTerm", searchTerm);
    currentPage = 1;
    renderBooks(getFilteredBooks());
  }

  function handleGenreFilter() {
    selectedGenre = genreFilter.value;
    currentPage = 1;
    renderBooks(getFilteredBooks());
  }

  function getFilteredBooks() {
    return booksData.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm);
      const matchesGenre =
        selectedGenre === "" || book.subjects?.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });
  }

  function renderBooks(books) {
    bookContainer.innerHTML = "";
    paginationContainer.innerHTML = "";

    const filteredBooks = getFilteredBooks();
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    setTimeout(() => {
      bookContainer.classList.add("opacity-100");
    }, 10);

    paginatedBooks.forEach((book) => {
      const isWishlisted = wishlist.includes(book.id);
      const bookCard = document.createElement("div");
      bookCard.className =
        "bg-white p-4 rounded shadow-md text-center flex flex-col items-center opacity-0 transform transition-all duration-300";
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
           ? "bg-red-500 text-white hover:bg-red-600 focus:outline-2 focus:outline-offset-2 focus:outline-red-500 active:bg-red-700"
           : "bg-gray-200 hover:bg-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-gray-500 active:bg-gray-400"
       }" data-id="${book.id}">
        ${isWishlisted ? "Remove from Wishlist 👎" : "Add to Wishlist 👍"}
</button>
      `;
      setTimeout(() => {
        bookCard.classList.add("opacity-100");
        bookCard.classList.remove("opacity-0");
      }, 100);

      bookContainer.appendChild(bookCard);
    });

    attachWishlistListeners();
    renderPagination(filteredBooks.length);
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
    updateWishlistCount();
  }

  function updateWishlistCount() {
    const count = wishlist.length;
    if (wishlistCount) {
      wishlistCount.textContent = `(${count})`;
    }
    if (wishlistCountMobile) {
      wishlistCountMobile.textContent = `(${count})`;
    }
  }

  function renderPagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);

    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.className = `px-4 py-2 mx-1 rounded border transition-all ${
        currentPage === i
          ? "bg-blue-600 text-white"
          : "bg-gray-200 hover:bg-gray-300"
      }`;
      pageButton.addEventListener("click", () => {
        currentPage = i;
        renderBooks(getFilteredBooks());
      });
      paginationContainer.appendChild(pageButton);
    }
  }

  fetchBooks();
});
