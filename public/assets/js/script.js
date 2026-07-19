let token = localStorage.getItem("authToken");

if (token) {
  document.getElementById("loginBtn").classList.add("hidden");
  document.getElementById("curatorAddFilmBtn").classList.remove("hidden");
  document.getElementById("manageCategoriesBtn").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.remove("hidden");
}

//lightbox triggers
document.querySelectorAll(".lightbox-trigger").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.target).classList.add("is-open");
  });
});
document.querySelectorAll(".lightbox-close, .lightbox-cancel").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.target).classList.remove("is-open");
  });
});

function register(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function login(e) { 
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Save the token in the local storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        token = data.token;

        alert("User Logged In successfully");

        // Fetch the posts list
        fetchPosts();

        // Hide the auth container and show the app container as we're now logged in
        document.getElementById("loginBtn").classList.add("hidden");
        document.getElementById("curatorAddFilmBtn").classList.remove("hidden");
        document.getElementById("manageCategoriesBtn").classList.remove("hidden");
        document.getElementById("logoutBtn").classList.remove("hidden");
        document.getElementById("loginOverlay").classList.remove("is-open");
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function logout() {
  fetch("/api/users/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => {
    // Clear the token from the local storage as we're now logged out
    localStorage.removeItem("authToken");
    token = null;
    window.location.reload();
  });
}

// =================================
// PULLS CATEGORIES FROM THE BACKEND
// =================================

let editingCategoryId = null;
let selectedCategory = null;

// Form Values moved to a function so they can be used for both creating and updating categories
function getCategoryFormValues() {
  return {
    category_name: document.getElementById("catName").value,
    schedule: document.getElementById("catSchedule").value,
    color: document.getElementById("catColor").value,
    programmer: document.getElementById("catProgrammer").value,
    description: document.getElementById("catDescription").value,
  };
}

function fetchCategories() {
  fetch("/api/categories", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })


    .then((res) => res.json())
    .then((categories) => {
      const postsContainer = document.getElementById("categoryList");
      postsContainer.innerHTML = "";
      categories.forEach((category) => {
        const div = document.createElement("div");
        div.innerHTML = `
        <h3>${category.category_name}</h3>
        <p>${category.description}</p>
        <small>By: ${category.programmer}</small>
        `;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          editingCategoryId = category.id;
          document.getElementById("categoryEditTitle").textContent = "Edit category";
          document.getElementById("catName").value = category.category_name;
          document.getElementById("catColor").value = category.color;
          document.getElementById("catSchedule").value = category.schedule;
          document.getElementById("catProgrammer").value = category.programmer;
          document.getElementById("catDescription").value = category.description;
          document.getElementById("categoryEditOverlay").classList.add("is-open");
        });
        div.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
          editingCategoryId = category.id;
          deleteCategory();
        });
        div.appendChild(deleteButton);

        postsContainer.appendChild(div);
        
        
      });

      // Dropdown build now sits outside the category-card loop, so it only runs once
      const catSelect = document.getElementById("filmCategory");
      catSelect.innerHTML = "";
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.innerHTML = category.category_name;
        catSelect.appendChild(option);
      });

      document.querySelectorAll("#tabs .cat-tab").forEach((btn) => btn.remove());
      const tabsContainer = document.getElementById("tabs");
      categories.forEach((category) => {
        const tabButton = document.createElement("button");
        tabButton.className = "tab cat-tab";
        tabButton.textContent = category.category_name;

// When this category tab is clicked, remember which category was picked
// and refresh the film grid so it only shows films in that category

        tabButton.addEventListener("click", () => {
  selectedCategory = category.id;
  fetchPosts();
});

        tabsContainer.insertBefore(tabButton, document.getElementById("manageCategoriesBtn"));
      });

    });
}

function createCategory() {

  // Editing an existing category? Update instead of creating a new one 
   if (editingCategoryId) {
    updateCategory();
    return;
  }
    
  const { category_name, schedule, color, programmer, description } = getCategoryFormValues();
  
  fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category_name, schedule, color, programmer, description }),
    })
    .then((res) => res.json())
    .then(() => {
      alert("Category saved successfully");
      document.getElementById("categoryEditOverlay").classList.remove("is-open");
      fetchCategories();
    });
}
function startNewCategory() {
  editingCategoryId = null;
  document.getElementById("categoryEditForm").reset();
  document.getElementById("categoryEditTitle").textContent = "Add category";
}
function updateCategory() {

  const { category_name, schedule, color, programmer, description } = getCategoryFormValues();

  fetch("/api/categories/" + editingCategoryId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category_name, schedule, color, programmer, description }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Category updated successfully"); 
      document.getElementById("categoryEditOverlay").classList.remove("is-open");     
      fetchCategories();
    });
}
function deleteCategory() {
  const { category_name, schedule, color, programmer, description } = getCategoryFormValues();

  fetch("/api/categories/" + editingCategoryId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category_name, schedule, color, programmer, description }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Category deleted successfully");
      fetchCategories();
    });
}
// =================================
// PULLS FILMS FROM THE BACKEND
// =================================

let editingFilmId = null;

// Form Values moved to a function so they can be used for both creating and updating categories
function getFilmFormValues() {
  return {
    title: document.getElementById("filmTitle").value,
    categoryId: document.getElementById("filmCategory").value,
    date: document.getElementById("filmDate").value,
    cert: document.getElementById("filmCert").value,
    genre: document.getElementById("filmGenre").value,
    runtime: document.getElementById("filmRuntime").value,
    year: document.getElementById("filmYear").value,
    image: document.getElementById("filmImage").value,
    hint: document.getElementById("filmHint").value,
    synopsis: document.getElementById("filmSynopsis").value,
  };
}

function fetchPosts() {
  fetch("/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => {
      const postsContainer = document.getElementById("grid");
      postsContainer.innerHTML = "";
      const filteredPosts = selectedCategory ? posts.filter((post) => post.categoryId === selectedCategory) : posts;
      filteredPosts.forEach((post) => {
      const div = document.createElement("div");
        div.innerHTML = `
            <div class="poster-visual" style="background-image:url('${post.image}')">
              <span class="date-tab">${post.date || ""}</span>
                ${post.cert ? `<span class="cert-badge">${post.cert}</span>` : ""}
            </div>
            <div class="poster-meta">
              <h3>${post.title}</h3>
              <p class="meta-line">${[post.genre, post.runtime, post.year].filter(Boolean).join(" · ")}</p>
            </div>
            <div class="card-actions"></div>
         `;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = token ? "" : "hidden";
        editButton.addEventListener("click", () => {
          editingFilmId = post.id;
          document.getElementById("filmTitle").value = post.title;
          document.getElementById("filmCategory").value = post.categoryId;
          document.getElementById("filmDate").value = post.date;
          document.getElementById("filmCert").value = post.cert;
          document.getElementById("filmGenre").value = post.genre;
          document.getElementById("filmRuntime").value = post.runtime;
          document.getElementById("filmYear").value = post.year;
          document.getElementById("filmImage").value = post.image;
          document.getElementById("filmHint").value = post.hint;
          document.getElementById("filmSynopsis").value = post.synopsis;
          document.getElementById("filmOverlay").classList.add("is-open");
        });
        div.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = token ? "" : "hidden";
        deleteButton.addEventListener("click", () => {
          editingFilmId = post.id;
          deleteFilm();
        });
        div.appendChild(deleteButton);

        postsContainer.appendChild(div);
      });
    });
}

function createPost() {


  // Editing an existing post? Update instead of creating a new one  
     if (editingFilmId) {
    updatePost();
    return;
  }

  const { title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis } = getFilmFormValues();

  fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
       document.getElementById("filmOverlay").classList.remove("is-open");
      fetchPosts();
    });
}
function startNewFilm() {
  editingFilmId = null;
  document.getElementById("filmEditForm").reset();
  document.getElementById("filmEditTitle").textContent = "Add film";
}
function updatePost() {
  const { title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis } = getFilmFormValues();

  fetch("/api/posts/" + editingFilmId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post updated successfully");
      document.getElementById("filmOverlay").classList.remove("is-open");
      fetchPosts();
    });
}


function deleteFilm() {
  const { title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis } = getFilmFormValues();

  fetch("/api/posts/" + editingFilmId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, categoryId, date, cert, genre, runtime, year, image, hint, synopsis, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Film deleted successfully");
      fetchPosts();
    });
}

fetchCategories();
fetchPosts();


