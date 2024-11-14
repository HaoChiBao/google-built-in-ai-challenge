console.log('Google ai')

// generate random id
const generateID = () => {
    return (
      Date.now().toString(36) + // Current timestamp in base 36
      Math.random().toString(36).substring(2, 10) // Random number in base 36
    );
}

// send messages to the service worker
const sendMessage = async (msg) => {
    try {
        await chrome.runtime.sendMessage(msg)
    } catch (e){
        return false
    }
    return true
}

const main = async () => {
    // const summarizer = await ai.summarizer.create({
    //     sharedContext: "summarize concisely",
    //     // type: "headline",
    //     length: "short"
    //   });


    // ```
    //     NOTE*
    //     rewriter and writer dont fucking work
    //     dog water below
    // ```

    // const rewriter = await ai.rewriter.create({
    //     sharedContext: "rewrite concisely"
    // })
    // const rewriter = await ai.rewriter.create()

    // const writer = await ai.writer.create();
    // const writer = await ai.writer.create({
    //     tone: "formal"
    // });
      


    const container = document.createElement('gemini-dropdown')
    const outline = document.createElement('gemini-outline')

    const dropdown = document.createElement('input')
    dropdown.type = 'dropdown'
    const image = document.createElement('img')
    image.src =  await chrome.runtime.getURL('images/gemini-stars-smol.png')

    outline.appendChild(dropdown)
    outline.appendChild(image)
    container.appendChild(outline)
    document.body.appendChild(container)    

        
    const wrapInHighlightSpan = (text, id) => {
        const highlightSpan = document.createElement("gemini-highlight");
        highlightSpan.id = id
        highlightSpan.textContent = text;
        highlightSpan.classList.add('active')

        highlightSpan.addEventListener('mouseover', () => {
            const all_highlights = document.querySelectorAll(`#${id}`)
            all_highlights.forEach(highlight => {
                highlight.classList.add('hover')
            })            
        })
        
        highlightSpan.addEventListener('mouseout', () => {
            const all_highlights = document.querySelectorAll(`#${id}`)
            all_highlights.forEach(highlight => {
                highlight.classList.remove('hover')
            })
        })

        highlightSpan.addEventListener('click', () => {

            const all_highlights = document.querySelectorAll(`#${id}`)
            all_highlights.forEach(highlight => {
                highlight.classList.remove('active')
            })

            const short = document.getElementById(`${id}-short`)
            short.classList.add('active')
            short.style.display = 'inline'

        })

        return highlightSpan;
    };

    const attachHighlightShort = (ai_response, id) => {
        
        const filler = document.createElement('gemini-highlight-short')
        // filler.innerHTML = html.html
        filler.innerHTML = ai_response
        // filler.innerHTML = `[ ${ai_response} ]`
        filler.id = `${id}-short`
        filler.classList.add('active')
        
        filler.classList.add('enter')
        setTimeout(()=>{ filler.classList.remove('enter') },1900)

        const all_highlights = document.querySelectorAll(`#${id}`)
        all_highlights.forEach(highlight => {
            highlight.classList.remove('active')
        })

        filler.addEventListener('mouseover', ()=> {filler.classList.add('hover')})
        filler.addEventListener('mouseout', ()=> {filler.classList.remove('hover')})

        filler.addEventListener('click', ()=> {
            filler.classList.remove('active')

            setTimeout(()=>{

                filler.style.display = 'none'
                
                const all_highlights = document.querySelectorAll(`#${id}`)
                all_highlights.forEach(highlight => {
                    highlight.classList.add('active')
                })

            },400)
        })
        
        // append the summary to the start of the highlight element
        const first_highlight = document.querySelector(`#${id}`)
        first_highlight.parentElement.insertBefore(filler, first_highlight)
        
    }
    
    // if user unselects text then remove the floating icon
    document.addEventListener('selectionchange', function() {
        const selection = window.getSelection();
      
        if (!selection.toString()) {
          container.classList.remove('active')
          return
        }
    })

    document.addEventListener('mouseup', function() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);

        // check if the highlight overlaps with another highlight
        const overlaps = (range) => {

            const startContainer = range.startContainer;
            const endContainer = range.endContainer;
    
            if (startContainer === endContainer) {
                return startContainer.parentElement.nodeName == 'GEMINI-HIGHLIGHT' || startContainer.parentElement.nodeName == 'GEMINI-HIGHLIGHT-SHORT' 
            } 
            const nodesToHighlight = [];
    
            const walkerFiltered = document.createTreeWalker(
                range.commonAncestorContainer,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                    },
                },
                false
            );

            let currentNode;
            while ((currentNode = walkerFiltered.nextNode())) {
                nodesToHighlight.push(currentNode);
            }

            let overlap = false
            nodesToHighlight.forEach(node => {
                if (node.parentElement.nodeName == 'GEMINI-HIGHLIGHT' || node.parentElement.nodeName == 'GEMINI-HIGHLIGHT-SHORT') {
                    overlap = true
                }
            })
            return overlap
        }

        // if the highlight overlaps with another GEMINI-HIGHLIGHT then don't give the option to summarize 
        if (overlaps(range)) return
    
        // highlight the user selected range and apply styling
        let highlightedText = "";
        const highlightRange = (range, id) => {
            const startContainer = range.startContainer;
            const endContainer = range.endContainer;
    
            if (startContainer === endContainer) {
                const selectedText = startContainer.textContent.slice(range.startOffset, range.endOffset);
                highlightedText += selectedText;
    
                const highlightedSpan = wrapInHighlightSpan(selectedText, id);
                const singleRange = document.createRange();
                singleRange.setStart(startContainer, range.startOffset);
                singleRange.setEnd(startContainer, range.endOffset);
    
                singleRange.deleteContents();
                singleRange.insertNode(highlightedSpan);
    
                return;
            } 
    
            const walkerFiltered = document.createTreeWalker(
                range.commonAncestorContainer,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                    },
                },
                false
            );
    
            const nodesToHighlight = [];
            let currentNode;
            while ((currentNode = walkerFiltered.nextNode())) {
                nodesToHighlight.push(currentNode);
            }

            nodesToHighlight.forEach(node => {
    
                const isStartNode = node === startContainer;
                const isEndNode = node === endContainer;
    
                let textToHighlight;
                if (isStartNode && isEndNode) {
                    textToHighlight = node.textContent.slice(range.startOffset, range.endOffset);
                } else if (isStartNode) {
                    textToHighlight = node.textContent.slice(range.startOffset);
                } else if (isEndNode) {
                    textToHighlight = node.textContent.slice(0, range.endOffset);
                } else {
                    textToHighlight = node.textContent;
                }
    
                highlightedText += textToHighlight;
    
                const highlightedSpan = wrapInHighlightSpan(textToHighlight, id);
                const replacementRange = document.createRange();
                const startOffset = isStartNode ? range.startOffset : 0;
                const endOffset = isEndNode ? range.endOffset : node.textContent.length;
                replacementRange.setStart(node, startOffset);
                replacementRange.setEnd(node, endOffset);
    
                replacementRange.deleteContents();
                replacementRange.insertNode(highlightedSpan);
            });
    
        };

        // move highlight to the same location as the highlight
        const rect = range.getBoundingClientRect()
        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.top = `${rect.top + window.scrollY - container.offsetHeight}px`;
        container.classList.add('active')

        outline.onclick = async () => {
            const id = generateID()
            console.log('highlight:', id)
            highlightRange(range, id);

            selection.removeAllRanges();
    
    
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

            await sendMessage({
                action: 'concise',
                highlightedText,
                id
            })

            // return
        }
    });



    // _______________ Establish Service Worker Connection _______________
    await chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            const action = request.action
            // console.log(request)
            switch(action){
                
                case 'concise':
                    console.log(request)
                    const concise = request.concise
                    const id_c = request.id
                    attachHighlightShort(concise, id_c)
                    break

                case 'test':
                    console.log(request)
                    break

                case 'refresh':
                    setTimeout(()=>{
                        sendMessage('refresh')
                    }, 20000)
                    break;
            }
        }
    );
  

    // const test = {
    //     action: 'test',
    //     data: {
    //         a: 'b'
    //     }
    // }
    // window.addEventListener('click', () => {
    //     sendMessage(test) 
    // })
}
main()