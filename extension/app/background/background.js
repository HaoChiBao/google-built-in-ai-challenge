import {AIResponse, findKeywords} from "./async/func/AIResponse.js"
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

            // case 'keywords':
            //     const text_k = request.highlightedText
            //     const id_k = request.id

            //     const response_k = await findKeywords(text_k)

            //     // console.log(response_k.keywords)

            //     if(response_k.status){
            //         return {action, id: id_k, keywords: response_k.keywords, status: true}
            //     }
            //     return {action, id: id_k, status: false}


            //     break;
            case 'generate':
                console.log('generating text...')
                const text_c = request.highlightedText
                const id_c = request.id
                const color_c = request.most_common_color
                const start = request.starting_gen

                // ____________________ get filter color for copy button in the response ____________________
                
                // const rgb = rgbSeparator(color_c)

                // const color = new Color(rgb[0], rgb[1], rgb[2]);
                // const solver = new Solver(color);
                // const result = solver.solve();
                // const filter = result.filter
                const filter = 0

                // console.log(result)

                // ____________________ get the ai response ____________________

                // const context = "Summarize the following text by 50% (be clear and concise):\n"
                // const context = "rewrite the following text shorter by 50% :\n"
                // const context = "rewrite the following text shorter (be clear and concise):\n"
                const concise_context = "condense the following text (be concise):\n"
                const elaborate_context = "make the following text a TINY BIT longer:\n"
                const short = await AIResponse(concise_context + text_c) 
                const long = await AIResponse(elaborate_context + text_c) 

                const keywords = await findKeywords(text_c)

                // return response. TRUE if response returns successfully
                if (short.status && long.status && keywords.status){
                    const concise = short.ai_response
                    const elaborate = long.ai_response
                    return {
                        action, status: true, 
                        concise, 
                        elaborate,
                        id: id_c, 
                        color: color_c, 
                        keywords: keywords.keywords,
                        filter,
                        start,
                    }
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