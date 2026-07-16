let token = localStorage.getItem("authToken");

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

function fetchCategories() {
  fetch("http://localhost:3001/api/categories", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
   .then((categories) => {
      window.categories = categories;
      renderAll();
    });
}
function createCategory() {
    
  const name = document.getElementById("catName").value;
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
    body: JSON.stringify({ name, color, schedule, programmer, description }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Category saved successfully");
      fetchPosts();
    });
}

// =================================
// PULLS FILMS FROM THE BACKEND
// =================================

function fetchPosts() {
  fetch("http://localhost:3001/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => {
      films = posts;
      renderAll();
    });
}

function createPost() {

  //Call the update function if we are editing a film
   if (editingFilmId) {
    updatePost();
    return;
  }
  const title = document.getElementById("filmTitle").value;
  const categoryId = document.getElementById("filmCategory").value;
  const date = document.getElementById("filmDate").value;
  const cert = document.getElementById("filmCert").value;
  const genre = document.getElementById("filmGenre").value;
  const runtime = document.getElementById("filmRuntime").value;
  const country = document.getElementById("filmCountry").value;
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
    body: JSON.stringify({ title, categoryId, date, cert, genre, runtime, country, year, image, hint, synopsis, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      fetchPosts();
    });
}
function updatePost() {
  const title = document.getElementById("filmTitle").value;
  const categoryId = document.getElementById("filmCategory").value;
  const date = document.getElementById("filmDate").value;
  const cert = document.getElementById("filmCert").value;
  const genre = document.getElementById("filmGenre").value;
  const runtime = document.getElementById("filmRuntime").value;
  const country = document.getElementById("filmCountry").value;
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
    body: JSON.stringify({ title, categoryId, date, cert, genre, runtime, country, year, image, hint, synopsis, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post updated successfully");
      fetchPosts();
    });
}
function deleteFilm() {
  const title = document.getElementById("filmTitle").value;
  const content = document.getElementById("filmSynopsis").value;

  fetch("http://localhost:3001/api/posts/" + editingFilmId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Film deleted successfully");
      fetchPosts();
    });
}

fetchCategories();
fetchPosts();