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

// Update collection name to match your exact Firebase collection
const COLLECTION_NAME = "form";

// Format data for display with specific fields
function formatData(data, id) {
    console.log("formatData called with:", data, id); // Add this line

    const item = document.createElement("div");
    item.classList.add("item");
    
    const header = document.createElement("div");
    header.classList.add("item-header");
    
    const title = document.createElement("div");
    // Update to use the specific field from your form data
    title.textContent = data.name || "Patient";
    
    const idElement = document.createElement("span");
    idElement.classList.add("item-id");
    idElement.textContent = `ID: ${id}`;
    
    header.appendChild(title);
    header.appendChild(idElement);
    
    const content = document.createElement("div");
    content.classList.add("item-content");
    
    // Format specific fields you want to display
    const formattedData = Object.entries(data)
        .filter(([key]) => key !== "name") // Exclude name as it's shown in header
        .map(([key, value]) => {
            // Format key to be more readable
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return `<strong>${formattedKey}:</strong> ${formatValue(value)}`;
        })
        .join("<br>");
    
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
    dataContainer.innerHTML = "<p class='loading'>Connecting to Firebase...</p>";

    try {
        // Listen for real-time updates
        const unsubscribe = onSnapshot(
            collection(db, COLLECTION_NAME),
            (snapshot) => {
                console.log("onSnapshot called"); // Add this line
                // Log snapshot metadata
                console.log("Snapshot metadata:", snapshot.metadata);

                // Clear container
                dataContainer.innerHTML = "";

                if (snapshot.empty) {
                    console.warn("No data found in collection:", COLLECTION_NAME);
                    dataContainer.innerHTML = "<p>No data found in collection.</p>";
                    return;
                }

                // Process each document
                snapshot.forEach(doc => {
                    console.log("Document data:", doc.id, doc.data()); // Log each document's data
                    const item = formatData(doc.data(), doc.id);

                    // Add animation class for new items
                    if (doc.metadata.hasPendingWrites) {
                        item.classList.add("new-item");
                    }

                    dataContainer.appendChild(item);
                });

                // Update status
                statusElement.innerHTML = `<span class="status-connected">✓ Connected to Firestore - ${snapshot.size} items</span>`;
            },
            (error) => {
                console.error("Firestore error in onSnapshot:", error);
                dataContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
                statusElement.innerHTML = `<span class="status-error">✗ Error: ${error.message}</span>`;
            }
        );

        // Return unsubscribe function (useful for cleanup if needed)
        return unsubscribe;
    } catch (error) {
        console.error("Setup error:", error);
        dataContainer.innerHTML = `<p>Failed to connect to Firestore.</p>`;
        statusElement.innerHTML = `<span class="status-error">✗ Connection Error: ${error.message}</span>`;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupRealtimeListener();
});