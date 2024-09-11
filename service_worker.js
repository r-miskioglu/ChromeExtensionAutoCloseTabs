const TIME = 1; //in minutes
const DEFAULTAUTOCLOSE = false;

//storing data with tabId as Key and {useAutoClose:boolean, showModal:boolean}
function storeData(tabId, data) {
    return new Promise((resolve, reject) => {
        const dataToStore = {};
        dataToStore[tabId.toString()] = JSON.stringify(data);
        
        chrome.storage.local.set(dataToStore, function() {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

function getData(tabId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(String(tabId), function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                const data = result[String(tabId)];
                if (data) {
                    resolve(JSON.parse(data));
                } else {
                    resolve(null);
                }
            }
        });
    });
}

function removeData(tabId){
    chrome.storage.local.remove(tabId, function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }});
}

async function initContentScript(tabId) {
    try {
        let data = await getData(tabId);
        
        if (!data) {
            // Create data
            data = {
                useAutoClose: false,
                showModal: true,
            };
            await storeData(tabId, data);
        }

        return data;
    } catch (error) {
        console.error("Error initializing content script:", error);
        return null;
    }
}

chrome.runtime.onConnect.addListener(function(port) {

    tabId = port.sender.tab.id;

    port.onMessage.addListener(async function(msg) {

        if(msg.action === "init content script"){
            try{
                result = await initContentScript(tabId);
                port.postMessage({action: "init content script", showModal:result.showModal});
            }
            catch(err){console.error(err)}
        }

        if(msg.action === "cancelAutoClose"){
            try{
                data = await getData(tabId);
            
                await chrome.alarms.clear(tabId.toString())

                data.showModal = false;
                data.useAutoClose = false;
                await storeData(tabId, data);

            }catch(err){console.error(err)}
        }
        if(msg.action === "enableAutoClose"){
            try{            
                data = await getData(tabId);
                
                await chrome.alarms.create(tabId.toString(), {delayInMinutes:TIME})

                data.showModal = false;
                data.useAutoClose = true;
                await storeData(tabId, data);
            }catch(err){console.error(err)}

        }
        if(msg.action === "inputDetected"){
            try{            
                data = await getData(tabId);
                if(data.useAutoClose){
                    await chrome.alarms.create(tabId.toString(), {delayInMinutes:TIME})
                    console.log("reset Alarm")
                }            
            }catch(err){console.error(err)}
            
        }
    });
});

//actually deleting the browser when chosen
function closeTab(tabId) {
    chrome.tabs.remove(parseInt(tabId));
}

chrome.alarms.onAlarm.addListener((alarm) => {
    closeTab(alarm.name)
});
