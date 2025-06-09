// NOTE: This script relies on the powerful chatgpt.js library @ https://chatgpt.js.org
// © 2023–2024 KudoAI & contributors under the MIT license
// Source: https://github.com/KudoAI/chatgpt.js
// Latest minified release: https://cdn.jsdelivr.net/npm/@kudoai/chatgpt.js/chatgpt.min.js

(async () => {

    // Import libs
    const { config, settings } = await import(chrome.runtime.getURL('lib/settings-utils.js'));
    const { chatgpt } = await import(chrome.runtime.getURL('lib/chatgpt.js'));

    // Add Chrome action msg listener
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'notify') notify(request.msg, request.position);
        else if (request.action === 'alert') alert(request.title, request.msg, request.btns);
        else if (typeof window[request.action] === 'function') {
            const args = Array.isArray(request.args) ? request.args // preserve array if supplied
                       : request.args !== undefined ? [request.args] : []; // convert to array if single or no arg
            window[request.action](...args); // call expression functions
        }
        return true;
    });

    await chatgpt.isLoaded();
    chatgpt.printAllFunctions(); // to console
    settings.load('skipAlert').then(() => {
        if (!config.skipAlert) {
            chatgpt.alert('≫ ChatGPT extension loaded! 🚀', // title
                'Success! Press Ctrl+Shift+J to view all chatgpt.js methods.', // msg
                function getHelp() { // button
                    window.open(config.ghRepoURL + '/issues', '_blank', 'noopener'); },
                function dontShowAgain() { // checkbox
                    settings.save('skipAlert', !config.skipAlert); }
    );}});

    if (location.hostname.endsWith('.wikipedia.org')
        && !location.hostname.startsWith('en.')) {
        translateWikipediaPage();
    }

    const params = new URLSearchParams(location.search);
    if (params.get('translate_page') === '1') {
        chrome.storage.local.get('chatgptJS_textsToTranslate', async ({ chatgptJS_textsToTranslate }) => {
            if (Array.isArray(chatgptJS_textsToTranslate)) {
                const results = [];
                for (const text of chatgptJS_textsToTranslate) {
                    const english = await chatgpt.translate(text, 'English');
                    results.push(english);
                }
                chrome.storage.local.set({ chatgptJS_translatedTexts: results }, () => {
                    window.close();
                });
            } else window.close();
        });
    }

    async function translateWikipediaPage() {
        const paragraphs = Array.from(document.querySelectorAll('p'));
        const texts = paragraphs.map(p => p.innerText.trim());
        chrome.storage.local.set({ chatgptJS_textsToTranslate: texts }, () => {
            window.open('https://chatgpt.com/?translate_page=1', '_blank');
        });
        const checkInterval = setInterval(() => {
            chrome.storage.local.get('chatgptJS_translatedTexts', ({ chatgptJS_translatedTexts }) => {
                if (Array.isArray(chatgptJS_translatedTexts)) {
                    paragraphs.forEach((p, i) => {
                        if (chatgptJS_translatedTexts[i]) p.innerText = chatgptJS_translatedTexts[i];
                    });
                    chrome.storage.local.remove(['chatgptJS_textsToTranslate', 'chatgptJS_translatedTexts']);
                    clearInterval(checkInterval);
                }
            });
        }, 1000);
    }

    // Define FEEDBACK functions

    function notify(msg, position = '', notifDuration = '', shadow = '') {
        chatgpt.notify(`${ config.appSymbol } ${ msg }`, position, notifDuration,
            shadow || chatgpt.isDarkMode() ? '' : 'shadow' ); }

    function alert(title = '', msg = '', btns = '', checkbox = '', width = '') {
        return chatgpt.alert(`${ config.appSymbol } ${ title }`, msg, btns, checkbox, width );}

    // Define SYNC function

    syncExtension = () => {
        settings.load('extensionDisabled').then(() => {
            if (config.extensionDisabled) {
                // remove your hacks
            } else {
                // sync each potentially updated setting passed to settings.load()
    }});};

})();
