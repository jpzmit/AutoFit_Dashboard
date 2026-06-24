import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Your exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeJrO0D_ccG-z0uncPyHg89LrSK15XCMc",
  authDomain: "autofit-ae75b.firebaseapp.com",
  projectId: "autofit-ae75b",
  storageBucket: "autofit-ae75b.firebasestorage.app",
  messagingSenderId: "1020837120566",
  appId: "1:1020837120566:web:52e858363ff81462126697",
  measurementId: "G-T5WCH261LY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById('dashboard-container');

// Query the 'restaurants' collection, ordering by newest first
const q = query(collection(db, "restaurants"), orderBy("timestamp", "desc"));

// Listen for real-time updates
onSnapshot(q, (snapshot) => {
    container.innerHTML = ''; // Clear container

    if (snapshot.empty) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:#7f8c8d;">No data synced yet. Export a file from your phone!</p>';
        return;
    }

    // Loop through all documents in the collection
    snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Format the Firebase server timestamp securely into a readable string
        let timeString = "Just now";
        if (data.timestamp) {
            const date = data.timestamp.toDate();
            timeString = date.toLocaleString();
        }

        // Create the main Card Div
        const card = document.createElement('div');
        card.className = 'card';

        // Build the Card Header (Restaurant Name & Timestamp)
        const headerHtml = `
            <h2>${data.restaurant || 'Unnamed Scan'}</h2>
            <div class="timestamp">Synced: ${timeString}</div>
        `;

        // Build the Items List
        const itemList = document.createElement('ul');
        itemList.className = 'item-list';

        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
                const li = document.createElement('li');
                
                // Only show the non-rotational tag if it's true
                const nonRotTag = item.isNonRotational ? '<span class="tag">Non-Rotational</span>' : '<span></span>';
                
                li.innerHTML = `
                    <div class="item-header">
                        <span>${item.itemName}</span>
                        <span>${item.weight_g}g</span>
                    </div>
                    <div class="item-details">
                        <span>${item.dimensions_cm.width} x ${item.dimensions_cm.height} x ${item.dimensions_cm.depth} cm</span>
                        ${nonRotTag}
                    </div>
                `;
                itemList.appendChild(li);
            });
        }

        // Assemble the card and append it to the container
        card.innerHTML = headerHtml;
        card.appendChild(itemList);
        container.appendChild(card);
    });
}, (error) => {
    console.error("Error listening to Firestore: ", error);
    container.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Error connecting to database. Check the console.</p>`;
});