let token = localStorage.getItem("authToken");

if (token) {
  document.getElementById("loginBtn").classList.add("hidden");
  document.getElementById("curatorAddFilmBtn").classList.remove("hidden");
  document.getElementById("manageCategoriesBtn").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.remove("hidden");
}
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
function register(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("http://localhost:3001/api/users", {
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

function login(event) { 
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("http://localhost:3001/api/users/login", {
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
  fetch("http://localhost:3001/api/users/logout", {
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

function fetchCategories() {
  fetch("http://localhost:3001/api/categories", {
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
    
  const category_name = document.getElementById("catName").value;
  const color = document.getElementById("catColor").value;
  const schedule = document.getElementById("catSchedule").value;
  const programmer = document.getElementById("catProgrammer").value;
  const description = document.getElementById("catDescription").value;
  
  fetch("http://localhost:3001/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category_name, color, schedule, programmer, description }),
    })
    .then((res) => res.json())
    .then(() => {
      alert("Category saved successfully");

      document.getElementById("categoryEditOverlay").classList.remove("is-open");
      fetchCategories();
    });
}
function updateCategory() {

  const category_name = document.getElementById("catName").value;
  const color = document.getElementById("catColor").value;
  const schedule = document.getElementById("catSchedule").value;
  const programmer = document.getElementById("catProgrammer").value;
  const description = document.getElementById("catDescription").value;

  fetch("http://localhost:3001/api/categories/" + editingCategoryId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category_name, color, schedule, programmer, description }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Category updated successfully");
      fetchCategories();
    });
}
function deleteCategory() {
  const category_name = document.getElementById("catName").value;
  const color = document.getElementById("catColor").value;
  const schedule = document.getElementById("catSchedule").value;
  const programmer = document.getElementById("catProgrammer").value;
  const description = document.getElementById("catDescription").value;

  fetch("http://localhost:3001/api/categories/" + editingCategoryId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category_name, color, schedule, programmer, description }),
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

function fetchPosts() {
  fetch("http://localhost:3001/api/posts", {
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
        <img src="${post.image}" alt="${post.title}" style="max-width:200px;">
        <h3>${post.title}</h3>
        <p>${post.synopsis}</p>
        <small>By: ${post.postedBy} on ${new Date(post.createdOn).toLocaleString()}</small>
        `;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = token ? "" : "hidden";
        editButton.addEventListener("click", () => {
          editingFilmId = post.id;
          document.getElementById("filmTitle").value = post.title;
          document.getElementById("filmCategory").value = post.categoryId;
          document.getElementById("filmCert").value = post.cert;
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

     if (editingFilmId) {
    updatePost();
    return;
  }

  const title = document.getElementById("filmTitle").value;
  const categoryId = document.getElementById("filmCategory").value;
  const cert = document.getElementById("filmCert").value;
  const year = document.getElementById("filmYear").value;
  const image = document.getElementById("filmImage").value;
  const hint = document.getElementById("filmHint").value;
  const synopsis = document.getElementById("filmSynopsis").value;

  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, categoryId, cert, year, image, hint, synopsis, postedBy: "User" }),
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
  const title = document.getElementById("filmTitle").value;
  const categoryId = document.getElementById("filmCategory").value;
  const cert = document.getElementById("filmCert").value;
  const year = document.getElementById("filmYear").value;
  const image = document.getElementById("filmImage").value;
  const hint = document.getElementById("filmHint").value;
  const synopsis = document.getElementById("filmSynopsis").value;

  fetch("http://localhost:3001/api/posts/" + editingFilmId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, categoryId, cert, year, image, hint, synopsis, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post updated successfully");
      document.getElementById("filmOverlay").classList.remove("is-open");
      fetchPosts();
    });
}


function deleteFilm() {
  const title = document.getElementById("filmTitle").value;
  const categoryId = document.getElementById("filmCategory").value;
  const cert = document.getElementById("filmCert").value;
  const year = document.getElementById("filmYear").value;
  const image = document.getElementById("filmImage").value;
  const hint = document.getElementById("filmHint").value;
  const synopsis = document.getElementById("filmSynopsis").value;

  fetch("http://localhost:3001/api/posts/" + editingFilmId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, categoryId, cert, year, image, hint, synopsis, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Film deleted successfully");
      fetchPosts();
    });
}

fetchCategories();
fetchPosts();


