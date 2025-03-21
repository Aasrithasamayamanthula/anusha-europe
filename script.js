// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot,
    addDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Get DOM elements
const dataContainer = document.getElementById("data-container");
const statusElement = document.getElementById("status");

// Firebase Configuration for your project
const firebaseConfig = {
    apiKey: "AIzaSyANxrzD7U5sO1eGxqYVAB-03x8LcJlkhyQ",
    authDomain: "anusha-europe.firebaseapp.com",
    projectId: "anusha-europe",
    storageBucket: "anusha-europe.firebasestorage.app",
    messagingSenderId: "1064718652154",
    appId: "1:1064718652154:web:dc6c0423dd04bea8642f43",
    measurementId: "G-YZJNFFPP4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Update collection name to match your Firebase collection
const COLLECTION_NAME = "users"; // Changed from "form" to "users"

// Format data for display with specific fields
function formatData(data, id) {
    const item = document.createElement("div");
    item.classList.add("item");
    
    const header = document.createElement("div");
    header.classList.add("item-header");
    
    const title = document.createElement("div");
    // Display name as title if available, otherwise show User
    title.textContent = data.username || data.name || "User";
    
    const idElement = document.createElement("span");
    idElement.classList.add("item-id");
    idElement.textContent = `ID: ${id}`;
    
    header.appendChild(title);
    header.appendChild(idElement);
    
    const content = document.createElement("div");
    content.classList.add("item-content");
    
    // Format specific fields you want to display
    let formattedData = "";
    if (data.email) {
        formattedData += `<strong>Email:</strong> ${data.email}<br>`;
    }
    if (data.phone || data.phoneNumber) {
        formattedData += `<strong>Phone:</strong> ${data.phone || data.phoneNumber}<br>`;
    }
    if (data.createdAt) {
        formattedData += `<strong>Created:</strong> ${new Date(data.createdAt).toLocaleString()}<br>`;
    }
    
    content.innerHTML = formattedData;
    
    item.appendChild(header);
    item.appendChild(content);
    
    return item;
}

// Format values for display (handle objects, arrays, etc.)
function formatValue(value) {
    if (value === null || value === undefined) {
        return "<em>null</em>";
    } else if (typeof value === "object") {
        if (value instanceof Date) {
            return value.toLocaleString();
        } else if (Array.isArray(value)) {
            return value.join(", ");
        } else {
            return JSON.stringify(value);
        }
    }
    return value;
}

// Setup real-time listener
function setupRealtimeListener() {
    dataContainer.innerHTML = "<p class='loading'>Loading data...</p>";

    try {
        return onSnapshot(
            collection(db, COLLECTION_NAME),
            (snapshot) => {
                dataContainer.innerHTML = "";

                if (snapshot.empty) {
                    dataContainer.innerHTML = "<p>No data found. Please add users to the database.</p>";
                    return;
                }

                snapshot.forEach(doc => {
                    const item = formatData(doc.data(), doc.id);
                    dataContainer.appendChild(item);
                });

                statusElement.innerHTML = `<span class="status-connected">✓ Connected - ${snapshot.size} users found</span>`;
            },
            (error) => {
                console.error("Firestore error:", error);
                dataContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
                statusElement.innerHTML = `<span class="status-error">✗ Connection Error</span>`;
            }
        );
    } catch (error) {
        console.error("Setup error:", error);
        dataContainer.innerHTML = `<p>Failed to connect to database</p>`;
        statusElement.innerHTML = `<span class="status-error">✗ Connection Failed</span>`;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupRealtimeListener();
});