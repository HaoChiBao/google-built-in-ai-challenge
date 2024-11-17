import AIResponse from "./async/func/AIResponse.js"
import { Color, Solver, componentToHex, rgbSeparator } from "./async/func/colorToFilterCSS.js"

const main = async () => {
    
            // console.log("Highlighted Text:", highlightedText);
            
            // const context = "condense the following text (be concise):\n"
            // const ai_response = await session.prompt(context + highlightedText)
            // console.log(ai_response)

            // __________________ testing __________________
            // const response = await fetch('http://localhost:8080/markdown', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         text: ai_response
            //     })
            // })

    const actionHandler = async (request) => {
        const action = request.action
        
        switch(action){

            case 'concise':
                console.log('shortening text...')
                const text_c = request.highlightedText
                const id_c = request.id
                const color_c = request.most_common_color

                // ____________________ get filter color for copy button in the response ____________________
                
                const rgb = rgbSeparator(color_c)
                // console.log(rgb)

                const color = new Color(rgb[0], rgb[1], rgb[2]);
                const solver = new Solver(color);
                const result = solver.solve();
                const filter = result.filter

                // console.log(result)

                // ____________________ get the ai response ____________________

                // const context = "Summarize the following text by 50% (be clear and concise):\n"
                // const context = "rewrite the following text shorter by 50% :\n"
                // const context = "rewrite the following text shorter (be clear and concise):\n"
                const context = "condense the following text (be concise):\n"
                const response = await AIResponse(context + text_c) 

                // return response. TRUE if response returns successfully
                if (response.status){
                    const ai_response = response.ai_response
                    return {action, status: true, concise: ai_response, id: id_c, color: color_c, filter}
                }

                return {action, status: false, id: id_c}
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