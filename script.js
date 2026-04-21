// RapidAPI Credentials
const RAPIDAPI_KEY = "YOUR_RAPIDAPI_KEY_HERE";
const RAPIDAPI_HOST = "rapidapi.com";


const fallbackDestinations = [
    { id: 1, name: "Maasai Mara", price: 500, img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600" },
    { id: 2, name: "Diani Beach", price: 300, img: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600" },
    { id: 3, name: "Amboseli National Park", price: 400, img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600" },
];

let destinations = [];

// Fetch destinations with timeout and better error handling
async function fetchDestinations() {
    const container = document.getElementById("destinations-list");
    if (!container) return;
    
    // Show loading immediately
    container.innerHTML = "<p style='text-align:center; color:#4a24f3; padding:20px;'>⏳ Loading destinations...</p>";

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
        // Check if API key exists
        if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "") {
            console.warn("⚠️ No RapidAPI key found. Using fallback data.");
            throw new Error("No API key");
        }

        // Fetch with timeout
        const response = await fetch(
            "https://travel-advisor.p.rapidapi.com/answers/v2/list?currency=USD&units=km&lang=en_US",
            {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": RAPIDAPI_KEY,
                    "X-RapidAPI-Host": RAPIDAPI_HOST
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const results = data.data || [];

        if (results.length > 0) {
            destinations = results
                .filter(item => item.name && item.result_type === "geos")
                .slice(0, 8)
                .map((item, index) => ({
                    id: index + 1,
                    name: item.name,
                    price: 300 + Math.floor(Math.random() * 400),
                    img: fallbackDestinations[index % fallbackDestinations.length].img
                }));
            
            console.log(`✅ Loaded ${destinations.length} destinations from API`);
        } else {
            throw new Error("No results found");
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn("⚠️ API failed, using fallback data:", error.message);
        
        // Simulate small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        destinations = [...fallbackDestinations];
    }

    renderDestinations();
}

// Render destination cards
function renderDestinations(filtered = destinations) {
    const container = document.getElementById("destinations-list");
    if (!container) return;
    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#666; padding:20px;'>No destinations found.</p>";
        return;
    }

    filtered.forEach(dest => {
        const card = document.createElement("div");
        card.className = "destination-card";
        card.style.cssText = `background: white; margin: 15px 0; padding: 10px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; transition: transform 0.2s;`;
        card.onmouseenter = () => card.style.transform = "translateY(-3px)";
        card.onmouseleave = () => card.style.transform = "translateY(0)";

        card.innerHTML = `
            <img src="${dest.img}" alt="${dest.name}" 
                 style="width:100%; height:220px; object-fit:cover; border-radius:8px;"
                 onerror="this.src='https://via.placeholder.com/600x220?text=No+Image'">
            <h3 style="margin:12px 0 6px; color:#333;">${dest.name}</h3>
            <p style="color:#4a24f3; font-weight:bold; font-size:18px;">From $${dest.price}</p>
            <button onclick="window.quickBook(${dest.id})" 
                    style="margin-top:10px; padding:10px 20px; background:#4a24f3; color:white; border:none; border-radius:5px; cursor:pointer;">
                Book Now
            </button>
        `;
        container.appendChild(card);
    });
}

// Search / Filter functionality
window.filterDestinations = function() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;

    const term = searchInput.value.toLowerCase().trim();
    const filtered = destinations.filter(d => d.name.toLowerCase().includes(term));
    renderDestinations(filtered);
};

// Quick book handler
window.quickBook = function(id) {
    const dest = destinations.find(d => d.id === id);
    if (dest) {
        alert(`Selected: ${dest.name}\nPrice: From $${dest.price}\n\nRedirecting to booking...`);
        window.goToSection("book");
    }
};

// Booking form initialization
function initBookingForm() {
    const form = document.getElementById("booking-form");
    if (!form) return;

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const date = document.getElementById("travel-date")?.value;
        const travelers = document.getElementById("travelers")?.value || "1";
        const email = document.getElementById("user-email")?.value;

        if (!date || !email) {
            alert("Please fill in the travel date and your email.");
            return;
        }

        const modalText = document.getElementById("modal-text");
        if (modalText) {
            modalText.innerHTML = `✅ Booking Confirmed!<br><br>
                📅 Date: ${date}<br>
                👥 Travelers: ${travelers}<br>
                📧 Email: ${email}`;
        }

        const modal = document.getElementById("success-modal");
        if (modal) modal.style.display = "flex";
    });
}

// Create success modal dynamically
function createSuccessModal() {
    if (document.getElementById("success-modal")) return;

    const modalHTML = `
        <div id="success-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; 
                                      background:rgba(0,0,0,0.75); align-items:center; justify-content:center; z-index:2000;">
            <div style="background:white; padding:30px; border-radius:12px; text-align:center; max-width:420px; width:90%;">
                <h3 id="modal-text" style="margin:0 0 20px 0; color:#333;"></h3>
                <button onclick="window.hideModal()" 
                        style="padding:12px 30px; background:#4a24f3; color:white; border:none; border-radius:6px; font-size:16px; cursor:pointer;">
                    OK
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// Hide modal (global)
window.hideModal = function() {
    const modal = document.getElementById("success-modal");
    if (modal) modal.style.display = "none";
};

// Smooth scroll (global)
window.goToSection = function(id) {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
};

// Initialize the app
window.onload = function() {
    console.log("🚀 Dream Adventures App Starting...");
    console.log("🔑 API Key loaded:", RAPIDAPI_KEY ? "Yes" : "No");
    
    createSuccessModal();
    initBookingForm();

    // Add real-time search listener
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", window.filterDestinations);
    }

    // Fetch destinations
    fetchDestinations();

    // Render blog/testimonial section
    const blogs = [
        "The Great Migration Experience - Rating 4.9 ⭐",
        "Beautiful Diani Beach Getaway - Rating 5.0 ⭐",
        "Wildlife Adventure in Amboseli - Rating 4.8 ⭐"
    ];

    const blogsContainer = document.getElementById("blogs-list");
    if (blogsContainer) {
        blogs.forEach(text => {
            const div = document.createElement("div");
            div.className = "blog-item";
            div.style.cssText = "background:#f9f9f9; padding:15px; margin:12px 0; border-radius:8px; font-size:15px;";
            div.textContent = text;
            blogsContainer.appendChild(div);
        });
    }

    console.log("✅ App Loaded Successfully!");
}; 