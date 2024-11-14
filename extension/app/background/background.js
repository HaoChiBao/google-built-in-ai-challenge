const main = async () => {
    
    const actionHandler = async (request) => {
        const action = request.action
        
        switch(action){
            
            case 'concise':
                const session = await ai.languageModel.create()
                console.log('shortening text...')
                const text_c = request.highlightedText
                const id_c = request.id
                // const context = "Summarize the following text by 50% (be clear and concise):\n"
                // const context = "rewrite the following text shorter by 50% :\n"
                // const context = "rewrite the following text shorter (be clear and concise):\n"
                const context = "condense the following text (be concise):\n"
                const ai_response = await session.prompt(context + text_c)
                return {action, concise: ai_response, id: id_c}
                break

            case 'refresh':
                return {action} 
                break;

            case 'test':
                return {action, request}
                break;
        }
    }

    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        await chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            
            const sendResponse = async (tabId, request) => {
                await chrome.tabs.sendMessage(tabId, request)
            }
            
            console.log('tabId', sender.tab.id)
            console.log(request)

            const sender_id = sender.tab.id
            
            const response = await actionHandler(request)
            console.log('response:', response)
            sendResponse(sender_id, response)
        })
    });

}

main()