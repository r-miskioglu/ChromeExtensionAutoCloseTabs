// Function to fetch and inject HTML and CSS content
function loadModal(showModal) {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch and inject CSS file
            const cssUrl = chrome.runtime.getURL('modal.css');
            const cssResponse = await fetch(cssUrl);
            if (!cssResponse.ok) {
                throw new Error(`Failed to fetch CSS file: ${cssResponse.statusText}`);
            }
            const cssText = await cssResponse.text();
            // Create a style element and append it to the head
            const styleElement = document.createElement('style');
            styleElement.textContent = cssText;
            document.head.appendChild(styleElement);
            
            // Fetch and inject HTML file
            const htmlUrl = chrome.runtime.getURL('modal.html');
            const htmlResponse = await fetch(htmlUrl);
            if (!htmlResponse.ok) {
                throw new Error(`Failed to fetch HTML file: ${htmlResponse.statusText}`);
            }
            const htmlText = await htmlResponse.text();
            
            // Create a temporary div to insert the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;
            
            // Append the HTML to the body or another element in the page
            document.body.appendChild(tempDiv.firstChild);
            
            document.getElementById('enableAutoClose').addEventListener('click', function() {
                port.postMessage({ action: 'enableAutoClose' });
                modal.style.display = "none";
            });
            
            document.getElementById('cancelAutoClose').addEventListener('click', function() {
                port.postMessage({action: "cancelAutoClose"})
                modal.style.display = "none";
            });

            const modal = document.getElementById('auto-close-modal');
            
            if (showModal) {
                modal.style.display = "flex";
            }

            //ADD LISTENERS FOR INPUT DETECTION

            // Listen for mouse movement
            document.addEventListener('mousemove', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('click', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('mousedown', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('mouseup', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('wheel', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('keydown', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('keyup', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('touchstart', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('touchmove', () => {port.postMessage({ action: 'inputDetected' })});
            document.addEventListener('touchend', () => {port.postMessage({ action: 'inputDetected' })});

            console.log('Modal and CSS injected into the page.');
            resolve(); // Indicate that the modal is fully loaded
        } catch (error) {
            console.error('Error loading modal:', error);
            reject(error); // Indicate that an error occurred
        }
    });
}

var port = chrome.runtime.connect();

port.postMessage({action: "init content script"});

port.onMessage.addListener(async function(msg) {
    console.log("Message received:", msg);
    
    if (msg.action === "init content script") {
        try {
            await loadModal(msg.showModal); // Wait for the modal to be loaded
            console.log("Modal is ready.");
        } catch (error) {
            console.error("Failed to load modal:", error);
        }
    }
    if (msg.action === ""){
        console.log("")
    }

});