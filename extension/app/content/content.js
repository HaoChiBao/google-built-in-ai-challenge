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
      
    // Initialize highlight options container
    const container = document.createElement('gemini-dropdown')
    const outline = document.createElement('gemini-outline')

    const submit_btn = document.createElement('button')
    
    const dropdown = document.createElement('select')
    dropdown.type = 'dropdown'
    dropdown.className = 'gemini-input'

    const options = ['Concise', 'Elaborate'];
    options.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText; 
        dropdown.appendChild(option); 
    });
    dropdown.addEventListener('click', (e) => {e.stopPropagation()})

    const image = document.createElement('img')
    image.src =  await chrome.runtime.getURL('images/gemini-stars-smol.png')

    submit_btn.appendChild(image)

    outline.appendChild(submit_btn)

    outline.appendChild(dropdown)
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

    const unhighlightSpan = (id) => {
        const highlights = document.querySelectorAll(`#${id}`)

        if (highlights.length === 0) {
            console.warn(`No highlights found with ID: ${id}`);
            return;
        }
    
        // Iterate through each highlighted span and replace it with its plain text content
        highlights.forEach((highlightSpan) => {
            const parent = highlightSpan.parentNode;
    
            // Replace the highlighted span with its plain text content
            parent.replaceChild(document.createTextNode(highlightSpan.textContent), highlightSpan);
    
            // Optionally clean up any empty parent elements if needed
            if (parent.nodeType === Node.ELEMENT_NODE && parent.textContent.trim() === '') {
                parent.remove();
            }
        });
    }

    const attachHighlightShort = (ai_response, id, color) => {
        
        const filler = document.createElement('gemini-highlight-short')
        // filler.innerHTML = html.html
        filler.innerHTML = ai_response
        // filler.innerHTML = `[ ${ai_response} ]`
        filler.id = `${id}-short`
        filler.classList.add('active')
        filler.style.setProperty('--text-color', color)
        
        // hide original highlight text and display generated
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
        let most_common_color = "#000"
        let largest_count = 0;
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

            const color_count = {}
            nodesToHighlight.forEach(node => {
                
                // find the most common color in the highlighted text
                // this will be the default color we use for the response color
                const current_color = getComputedStyle(node.parentElement).color
                if (color_count[current_color] == undefined || color_count[current_color] == null){
                    color_count[current_color] = node.textContent.length
                } else color_count[current_color] += node.textContent.length

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

            Object.keys(color_count).forEach(color => {
                const count = color_count[color]
                if (count > largest_count){
                    largest_count = count
                    most_common_color = color
                }
            })

            // reset count
            largest_count = 0
        };

        // move highlight to the same location as the highlight
        const rect = range.getBoundingClientRect()
        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.top = `${rect.top + window.scrollY - container.offsetHeight}px`;
        container.classList.add('active')

        outline.onclick = async () => {
            const id = generateID()
            console.log('highlight:', id)

            // highlight selected range
            highlightRange(range, id);
            // remove user select highlight
            selection.removeAllRanges();

            console.log('color:', most_common_color)
            await sendMessage({
                action: 'concise',
                highlightedText,
                id,
                most_common_color,
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
                    const status_c = request.status
                    const id_c = request.id
                    
                    if (status_c) {
                        const concise = request.concise
                        const color_c = request.color
                        attachHighlightShort(concise, id_c, color_c)
                    } else {
                        unhighlightSpan(id_c)
                    }

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