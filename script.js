/* =============================================
   Lumière Photo Gallery — script.js
   Simple, well-commented, beginner-friendly
   Features: gallery, filter, search, sort,
   upload (real image files), custom categories,
   lightbox, favorites, dark mode, back-to-top
============================================= */


// ==========================================
// 1. SAMPLE PHOTOS (preloaded in gallery)
// ==========================================

const SAMPLE_PHOTOS = [
  // Nature (4 photos)
  { id: 1,  src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85", title: "Rocky Mountain Peak",   category: "nature",  time: Date.now() - 11*86400000 },
  { id: 2,  src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=85", title: "Misty Forest Path",     category: "nature",  time: Date.now() - 10*86400000 },
  { id: 3,  src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=900&q=85", title: "Waterfall in Jungle",   category: "nature",  time: Date.now() -  9*86400000 },
  { id: 4,  src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=85", title: "Golden Valley Sunrise", category: "nature",  time: Date.now() -  8*86400000 },
  // Animals (4 photos)
  { id: 5,  src: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&q=85", title: "Playful Golden Dog",    category: "animals", time: Date.now() -  7*86400000 },
  { id: 6,  src: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=900&q=85", title: "Bengal Tiger Close-up", category: "animals", time: Date.now() -  6*86400000 },
  { id: 7,  src: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=900&q=85", title: "Eagle in Flight",       category: "animals", time: Date.now() -  5*86400000 },
  { id: 8,  src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=900&q=85", title: "Arctic Fox Portrait",   category: "animals", time: Date.now() -  4*86400000 },
  // People (4 photos)
  { id: 9,  src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=85", title: "Portrait in Golden Hour", category: "people", time: Date.now() -  3*86400000 },
  { id: 10, src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85", title: "Friends Laughing",       category: "people", time: Date.now() -  2*86400000 },
  { id: 11, src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=85", title: "Childhood Happiness",    category: "people", time: Date.now() -  1*86400000 },
  { id: 12, src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=85", title: "Young Traveler",         category: "people", time: Date.now() }
];


// ==========================================
// 2. APP STATE (variables that track app)
// ==========================================

let allPhotos     = [...SAMPLE_PHOTOS]; // all photos in gallery
let nextId        = 13;                 // ID counter for new uploads
let activeFilter  = "all";             // which category button is active
let searchText    = "";                // what user typed in search
let sortOrder     = "newest";          // current sort option

// Favorites: load from localStorage (so they survive page refresh)
let favorites = new Set(
  JSON.parse(localStorage.getItem("gallery_favs") || "[]")
);

// Custom categories the user has created (besides default 3)
let customCategories = JSON.parse(
  localStorage.getItem("gallery_custom_cats") || "[]"
);

// Lightbox: which photo index is open
let lbIndex    = 0;
let visibleIds = []; // IDs of photos currently shown

// Image picked for upload (stored as base64 data URL)
let pickedImageDataURL = null;


// ==========================================
// 3. GET DOM ELEMENTS
// ==========================================

const gallery       = document.getElementById("gallery");
const emptyMsg      = document.getElementById("emptyMsg");
const photoCount    = document.getElementById("photoCount");
const searchInput   = document.getElementById("searchInput");
const filterBtns    = document.getElementById("filterBtns");
const sortSelect    = document.getElementById("sortSelect");
const themeBtn      = document.getElementById("themeBtn");
const toggleUpload  = document.getElementById("toggleUploadBtn");
const uploadBox     = document.getElementById("uploadBox");
const fileInput     = document.getElementById("fileInput");
const previewImg    = document.getElementById("previewImg");
const uploadTitle   = document.getElementById("uploadTitle");
const catSelect     = document.getElementById("catSelect");
const newCatInput   = document.getElementById("newCatInput");
const uploadBtn     = document.getElementById("uploadBtn");
const backTop       = document.getElementById("backTop");
const lightbox      = document.getElementById("lightbox");
const lbImg         = document.getElementById("lbImg");
const lbTitleEl     = document.getElementById("lbTitle");
const lbCatEl       = document.getElementById("lbCat");
const lbDownload    = document.getElementById("lbDownload");
const lbClose       = document.getElementById("lbClose");
const lbPrev        = document.getElementById("lbPrev");
const lbNext        = document.getElementById("lbNext");


// ==========================================
// 4. RENDER GALLERY
// ==========================================

function renderGallery() {
  // Step 1: filter photos by active category
  let list = allPhotos.filter(photo => {
    if (activeFilter === "favorites") return favorites.has(photo.id);
    if (activeFilter !== "all")       return photo.category === activeFilter;
    return true; // "all" shows everything
  });

  // Step 2: filter by search text (matches title)
  if (searchText.trim()) {
    list = list.filter(p =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  // Step 3: sort the list
  list = sortList(list);

  // Step 4: remember which IDs are visible (for lightbox prev/next)
  visibleIds = list.map(p => p.id);

  // Step 5: update photo count text
  photoCount.textContent = list.length + " photo" + (list.length !== 1 ? "s" : "");

  // Step 6: clear old cards from gallery
  gallery.innerHTML = "";

  // Step 7: show empty message if nothing found
  if (list.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  // Step 8: create and add a card for each photo
  list.forEach((photo, index) => {
    const card = makeCard(photo, index);
    gallery.appendChild(card);
  });
}


// ==========================================
// 5. CREATE ONE CARD
// ==========================================

function makeCard(photo, index) {
  const isFav = favorites.has(photo.id);

  // Create the card container
  const card = document.createElement("div");
  card.className = "card";
  card.style.animationDelay = Math.min(index * 50, 400) + "ms";

  // Image area
  const imgArea = document.createElement("div");
  imgArea.className = "card-img";

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.title;
  img.loading = "lazy";

  // Category badge (little label on image)
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = capitalize(photo.category);

  // Like / heart button
  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn" + (isFav ? " liked" : "");
  likeBtn.innerHTML = isFav ? "♥" : "♡";
  likeBtn.title = isFav ? "Unlike" : "Like";

  // When like is clicked, toggle favorite (don't open lightbox)
  likeBtn.addEventListener("click", function(e) {
    e.stopPropagation(); // stop card click from firing
    toggleFav(photo.id, likeBtn);
  });

  imgArea.appendChild(img);
  imgArea.appendChild(badge);
  imgArea.appendChild(likeBtn);

  // Bottom info bar
  const info = document.createElement("div");
  info.className = "card-info";

  const titleEl = document.createElement("span");
  titleEl.className = "card-title";
  titleEl.textContent = photo.title;

  // Download link
  const dlLink = document.createElement("a");
  dlLink.className = "card-dl";
  dlLink.href = photo.src;
  dlLink.download = photo.title || "photo";
  dlLink.title = "Download";
  dlLink.innerHTML = "⬇";
  dlLink.addEventListener("click", e => e.stopPropagation()); // don't open lightbox

  info.appendChild(titleEl);
  info.appendChild(dlLink);

  card.appendChild(imgArea);
  card.appendChild(info);

  // Click card to open lightbox
  card.addEventListener("click", () => openLightbox(photo.id));

  return card;
}


// ==========================================
// 6. SORT FUNCTION
// ==========================================

function sortList(arr) {
  return [...arr].sort((a, b) => {
    if (sortOrder === "newest") return b.time - a.time;
    if (sortOrder === "oldest") return a.time - b.time;
    if (sortOrder === "az")     return a.title.localeCompare(b.title);
    if (sortOrder === "za")     return b.title.localeCompare(a.title);
    return 0;
  });
}


// ==========================================
// 7. FAVORITES
// ==========================================

function toggleFav(id, btn) {
  if (favorites.has(id)) {
    // Remove from favorites
    favorites.delete(id);
    btn.classList.remove("liked");
    btn.innerHTML = "♡";
    btn.title = "Like";
  } else {
    // Add to favorites
    favorites.add(id);
    btn.classList.add("liked");
    btn.innerHTML = "♥";
    btn.title = "Unlike";

    // Small pop animation
    btn.style.transform = "scale(1.5)";
    setTimeout(() => btn.style.transform = "", 200);
  }

  // Save to localStorage
  localStorage.setItem("gallery_favs", JSON.stringify([...favorites]));

  // If user is on Favorites filter, re-render to update the view
  if (activeFilter === "favorites") renderGallery();
}


// ==========================================
// 8. LIGHTBOX (fullscreen image view)
// ==========================================

function openLightbox(id) {
  lbIndex = visibleIds.indexOf(id);
  showLightboxPhoto(lbIndex);
  lightbox.style.display = "flex";
  document.body.style.overflow = "hidden"; // prevent page scroll
}

function showLightboxPhoto(idx) {
  const id    = visibleIds[idx];
  const photo = allPhotos.find(p => p.id === id);
  if (!photo) return;

  lbImg.src             = photo.src;
  lbImg.alt             = photo.title;
  lbTitleEl.textContent = photo.title;
  lbCatEl.textContent   = capitalize(photo.category);
  lbDownload.href       = photo.src;
  lbDownload.download   = photo.title || "photo";

  // Dim arrows at edges
  lbPrev.style.opacity = idx > 0 ? "1" : "0.3";
  lbNext.style.opacity = idx < visibleIds.length - 1 ? "1" : "0.3";
}

function closeLightbox() {
  lightbox.style.display = "none";
  document.body.style.overflow = ""; // restore scroll
}

// Close button
lbClose.addEventListener("click", closeLightbox);

// Click outside image to close
lightbox.addEventListener("click", function(e) {
  if (e.target === lightbox) closeLightbox();
});

// Prev / Next buttons
lbPrev.addEventListener("click", function() {
  if (lbIndex > 0) { lbIndex--; showLightboxPhoto(lbIndex); }
});
lbNext.addEventListener("click", function() {
  if (lbIndex < visibleIds.length - 1) { lbIndex++; showLightboxPhoto(lbIndex); }
});

// Keyboard navigation
document.addEventListener("keydown", function(e) {
  if (lightbox.style.display === "none") return;
  if (e.key === "Escape")     closeLightbox();
  if (e.key === "ArrowLeft")  { if (lbIndex > 0) { lbIndex--; showLightboxPhoto(lbIndex); } }
  if (e.key === "ArrowRight") { if (lbIndex < visibleIds.length - 1) { lbIndex++; showLightboxPhoto(lbIndex); } }
});


// ==========================================
// 9. FILTER BUTTONS
// ==========================================

// Delegated listener — works for both original and custom-category buttons
filterBtns.addEventListener("click", function(e) {
  if (!e.target.classList.contains("filter-btn")) return;

  // Remove "active" from all buttons
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));

  // Mark clicked button active
  e.target.classList.add("active");
  activeFilter = e.target.dataset.filter;
  renderGallery();
});


// ==========================================
// 10. SEARCH
// ==========================================

searchInput.addEventListener("input", function() {
  searchText = searchInput.value;
  renderGallery();
});


// ==========================================
// 11. SORT
// ==========================================

sortSelect.addEventListener("change", function() {
  sortOrder = sortSelect.value;
  renderGallery();
});


// ==========================================
// 12. DARK MODE
// ==========================================

// Apply saved theme when page loads
if (localStorage.getItem("gallery_theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀";
}

themeBtn.addEventListener("click", function() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeBtn.textContent = isDark ? "☀" : "☽";
  localStorage.setItem("gallery_theme", isDark ? "dark" : "light");
});


// ==========================================
// 13. UPLOAD PANEL (show/hide)
// ==========================================

toggleUpload.addEventListener("click", function() {
  uploadBox.classList.toggle("open");
  toggleUpload.textContent = uploadBox.classList.contains("open")
    ? "✕ Close Upload"
    : "＋ Upload a Photo";
});


// ==========================================
// 14. FILE PICKER — shows preview image
// ==========================================

fileInput.addEventListener("change", function() {
  const file = fileInput.files[0];

  // Make sure a file was actually picked
  if (!file) return;

  // Make sure it is an image
  if (!file.type.startsWith("image/")) {
    alert("Please pick an image file (jpg, png, gif, etc.)");
    return;
  }

  // Use FileReader to read the image as a data URL (base64 string)
  const reader = new FileReader();

  reader.onload = function(event) {
    // Save the data URL so we can use it when adding to gallery
    pickedImageDataURL = event.target.result;

    // Show the preview image
    previewImg.src     = pickedImageDataURL;
    previewImg.style.display = "block";
  };

  reader.readAsDataURL(file); // this triggers reader.onload above
});


// ==========================================
// 15. UPLOAD SUBMIT — add photo to gallery
// ==========================================

uploadBtn.addEventListener("click", function() {

  // --- Validation ---

  // 1. Must have picked an image
  if (!pickedImageDataURL) {
    alert("Please choose an image first.");
    return;
  }

  // 2. Get title (use filename or "Untitled" if empty)
  const title = uploadTitle.value.trim() || "Untitled";

  // 3. Decide category:
  //    - If user typed a new category name, use that
  //    - Otherwise use the dropdown selection
  let category = "";

  const newCatTyped = newCatInput.value.trim().toLowerCase();

  if (newCatTyped) {
    // User typed a new category — use it
    category = newCatTyped;

    // If this category doesn't exist yet, add it as a filter button
    if (!customCategories.includes(category)) {
      addCategoryButton(category);
      addCategoryToDropdown(category);
      customCategories.push(category);
      localStorage.setItem("gallery_custom_cats", JSON.stringify(customCategories));
    }
  } else if (catSelect.value) {
    // User chose from dropdown
    category = catSelect.value;
  } else {
    alert("Please select a category or type a new one.");
    return;
  }

  // --- Create the new photo object ---
  const newPhoto = {
    id:       nextId++,
    src:      pickedImageDataURL,  // base64 image data
    title:    title,
    category: category,
    time:     Date.now()
  };

  // Add to the beginning of the array (shows up first)
  allPhotos.unshift(newPhoto);

  // Re-render gallery (set sort to newest so new photo is visible)
  sortOrder = "newest";
  sortSelect.value = "newest";
  renderGallery();

  // --- Reset the upload form ---
  pickedImageDataURL    = null;
  fileInput.value       = "";
  previewImg.src        = "";
  previewImg.style.display = "none";
  uploadTitle.value     = "";
  catSelect.value       = "";
  newCatInput.value     = "";

  // Close upload panel
  uploadBox.classList.remove("open");
  toggleUpload.textContent = "＋ Upload a Photo";

  // Scroll to gallery
  gallery.scrollIntoView({ behavior: "smooth" });
});


// ==========================================
// 16. CUSTOM CATEGORY HELPERS
// ==========================================

// Add a new filter button for a custom category
function addCategoryButton(catName) {
  const btn = document.createElement("button");
  btn.className    = "filter-btn";
  btn.dataset.filter = catName;
  btn.textContent  = capitalize(catName);

  // Insert before the Favorites button
  const favBtn = document.querySelector(".fav-btn");
  filterBtns.insertBefore(btn, favBtn);
}

// Add the new category as an option in the upload dropdown
function addCategoryToDropdown(catName) {
  const option = document.createElement("option");
  option.value       = catName;
  option.textContent = capitalize(catName);
  catSelect.appendChild(option);
}


// ==========================================
// 17. RESTORE CUSTOM CATEGORIES ON PAGE LOAD
// ==========================================

// If user created custom categories before, add their buttons back
customCategories.forEach(cat => {
  addCategoryButton(cat);
  addCategoryToDropdown(cat);
});


// ==========================================
// 18. BACK TO TOP BUTTON
// ==========================================

window.addEventListener("scroll", function() {
  if (window.scrollY > 300) {
    backTop.classList.add("show");
  } else {
    backTop.classList.remove("show");
  }
});

backTop.addEventListener("click", function() {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


// ==========================================
// 19. HELPER: capitalize first letter
// ==========================================

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ==========================================
// 20. START — render gallery on page load
// ==========================================

renderGallery();