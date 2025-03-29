document.addEventListener("DOMContentLoaded", function () {
  const bookContainer = document.getElementById("book-container");
  const wishlistCount = document.getElementById("wishlist-count");
  const wishlistCountMobile = document.getElementById("wishlist-count-mobile");
  const paginationContainer = document.getElementById("pagination-container");

  let booksData = [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let currentPage = 1;
  const booksPerPage = 8;

  async function fetchBooks() {
    try {
      const response = await fetch("https://gutendex.com/books");
      const data = await response.json();
      booksData = data.results;
      loadWishlistBooks();
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  function loadWishlistBooks() {
    const wishlistBooks = booksData.filter((book) =>
      wishlist.includes(book.id)
    );

    renderBooks(wishlistBooks);
    renderPagination(wishlistBooks.length);
    updateWishlistCount();
  }

  function renderBooks(books) {
    bookContainer.innerHTML = "";
    books.forEach((book) => {
      const bookCard = document.createElement("div");
      bookCard.className =
        "bg-white p-4 rounded shadow-md text-center flex flex-col items-center transition-all duration-300 ease-in-out";
      bookCard.innerHTML = `
            <img src="${book.formats["image/jpeg"]}" alt="${
        book.title
      }" class="w-full h-48 object-cover mb-4 rounded">
            <h3 class="text-lg font-semibold mb-2">${book.title}</h3>
            <p class="text-gray-600 mb-4">${book.authors
              .map((a) => a.name)
              .join(", ")}</p>
            <button class="wishlist-btn mt-auto w-full px-4 py-2 rounded transition-all duration-300 ${
              wishlist.includes(book.id)
                ? "bg-red-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }" data-id="${book.id}">
              ${
                wishlist.includes(book.id)
                  ? "Remove from Wishlist 👎"
                  : "Add to Wishlist ❤️"
              }
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
      button.textContent = "Add to Wishlist ❤️";
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
        loadWishlistBooks();
      });
      paginationContainer.appendChild(pageButton);
    }
  }

  fetchBooks();
});
