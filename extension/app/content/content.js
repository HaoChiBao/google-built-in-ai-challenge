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

const HIGHLIGHT_DELAY_TIME = 150

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

    const highlight_delays = {}
    const wrapInHighlightSpan = (text, id) => {
        const highlightSpan = document.createElement("gemini-highlight");
        highlightSpan.id = id
        highlightSpan.textContent = text;
        highlightSpan.classList.add('active')
        highlightSpan.classList.add('enter')
        setTimeout(()=>{highlightSpan.classList.remove('enter')}, 2900)

        highlight_delays[id] = null
        highlightSpan.addEventListener('mouseover', () => {
            clearTimeout(highlight_delays[id])

            const all_highlights = document.querySelectorAll(`#${id}`)
            all_highlights.forEach(highlight => {
                highlight.classList.add('hover')
            })   
            
            const first_highlight = document.querySelector(`#${id}`)
            const toggle = document.querySelector(`#${id}-toggle`)


            const rect = first_highlight.getBoundingClientRect()
            toggle.style.left = `${rect.left + window.scrollX}px`;
            toggle.style.top = `${rect.top + window.scrollY - toggle.offsetHeight}px`;
            toggle.classList.add('active')
        })
        
        highlightSpan.addEventListener('mouseout', () => {
            highlight_delays[id] = setTimeout(()=>{
                const all_highlights = document.querySelectorAll(`#${id}`)
                all_highlights.forEach(highlight => {
                    highlight.classList.remove('hover')
                })

                const toggle = document.querySelector(`#${id}-toggle`)
                toggle.classList.remove('active')
            }, HIGHLIGHT_DELAY_TIME)
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

        // get generated highlighted text and remove it 
        // get toggle highlight and remove it 
        const toggle = document.querySelector(`#${id}-toggle`)
        toggle.remove()
    }

    const attachHighlightToggle = (id) => {
        const holder = document.createElement('gemini-dropdown')
        holder.id = `${id}-toggle`
        const inside = document.createElement('gemini-outline')

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

        // create toggle element
        // custom switch: start _____________________________________
        const toggle = document.createElement('span')
        toggle.className = 'custom-switch'
        
        const input = document.createElement('input')
        input.id = `toggle-goal-stats-${id}`
        input.class = 'custom-switch-active'
        input.type = 'checkbox'
        
        const label = document.createElement('label')
        label.setAttribute('for', `toggle-goal-stats-${id}`)
        
        toggle.appendChild(input)
        toggle.appendChild(label)
        // custom switch: end _____________________________________

        input.addEventListener('change', () => {

            // ____________________________ ON _______________________________
            if (input.checked) {
                toggle.style.setProperty('--switch-background', '#448cd0')
                
                const all_highlights = document.querySelectorAll(`#${id}`)
                all_highlights.forEach(highlight => {
                    highlight.classList.remove('active')
                })
                
                const short = document.getElementById(`${id}-short`)
                short.classList.add('active')
                short.style.display = 'inline'
                
                
                // ____________________________ OFF _______________________________
            } else {
                toggle.style.setProperty('--switch-background', '#e1e1e1')
                
                const filler = document.querySelector(`#${id}-short`)
                filler.classList.remove('active')
                
                setTimeout(()=>{
    
                    filler.style.display = 'none'
                    
                    const all_highlights = document.querySelectorAll(`#${id}`)
                    all_highlights.forEach(highlight => {
                        highlight.classList.add('active')
                    })
    
                }, 400)
                
            }
        })

        holder.addEventListener('mouseover', () => {
            clearTimeout(highlight_delays[id])

            const all_highlights = document.querySelectorAll(`#${id}`)
            all_highlights.forEach(highlight => {
                highlight.classList.add('hover')
            })   
            holder.classList.add('active')
        })
        
        holder.addEventListener('mouseout', () => {
            highlight_delays[id] = setTimeout(()=>{
                const all_highlights = document.querySelectorAll(`#${id}`)
                all_highlights.forEach(highlight => {
                    highlight.classList.remove('hover')
                })
                holder.classList.remove('active')
            }, HIGHLIGHT_DELAY_TIME)
        })

        inside.appendChild(toggle)
        inside.appendChild(dropdown)
        holder.appendChild(inside)

        document.body.appendChild(holder)
    }

    const attachHighlightText = async (ai_response, id, color, filter) => {

        const filler = document.createElement('gemini-highlight-gen')
        // filler.innerHTML = html.html
        filler.innerHTML = ai_response
        // filler.innerHTML = `[ ${ai_response} ]`
        filler.id = `${id}-short`
        filler.classList.add('active')
        filler.style.setProperty('--text-color', color)

        const copy = document.createElement('gemini-copy')

        const copy_inner = document.createElement('div')
        copy_inner.className = 'copy_inner'
        // copy_inner.innerHTML = 'copy'

        const copy_img = document.createElement('img')
        copy_img.src = await chrome.runtime.getURL('images/copy-smol.png')
        copy_img.style.filter = filter


        copy_inner.appendChild(copy_img)
        copy.appendChild(copy_inner)

        filler.appendChild(copy)


        
        // hide original highlight text and display generated
        filler.classList.add('enter')
        setTimeout(()=>{ filler.classList.remove('enter') },1900)
        const all_highlights = document.querySelectorAll(`#${id}`)
        all_highlights.forEach(highlight => {
            highlight.classList.remove('active')
        })

        filler.addEventListener('mouseover', ()=> {
            filler.classList.add('hover')

            // reveal toggle element
            clearTimeout(highlight_delays[id])
            // const toggle = document.querySelector(`#${id}-toggle`)
    
            const rect = filler.getBoundingClientRect()
            toggle.style.left = `${rect.left + window.scrollX}px`;
            toggle.style.top = `${rect.top + window.scrollY - toggle.offsetHeight}px`;
            toggle.classList.add('active')
        })
        
        filler.addEventListener('mouseout', ()=> {
            filler.classList.remove('hover')

            highlight_delays[id] = setTimeout(()=>{
                // const toggle = document.querySelector(`#${id}-toggle`)
                toggle.classList.remove('active')
            }, HIGHLIGHT_DELAY_TIME)
            // hide toggle element
        })
        
        // append the summary to the start of the highlight element
        const first_highlight = document.querySelector(`#${id}`)
        first_highlight.parentElement.insertBefore(filler, first_highlight)

        // toggle box on
        const toggle = document.querySelector(`#${id}-toggle`)
        const checkmark = toggle.querySelector('input')
        checkmark.checked = true
        const event = new Event('change');
        checkmark.dispatchEvent(event);
        
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

            attachHighlightToggle(id)

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
                
                // case 'color-filter':
                //     console.log(action)
                //     break;
                case 'concise':
                    console.log(request)
                    const status_c = request.status
                    const id_c = request.id
                    
                    if (status_c) {
                        const concise = request.concise
                        const color_c = request.color
                        const filter_c  = request.filter
                        attachHighlightText(concise, id_c, color_c, filter_c)
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