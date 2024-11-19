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
let starting_gen = 0

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
    submit_btn.className = 'gen-submit'
    
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
    dropdown.addEventListener('change', (e) => {
        starting_gen = e.target.selectedIndex
    })

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

    const attachHighlightToggle = async (id) => {
        const holder = document.createElement('gemini-dropdown')
        holder.id = `${id}-toggle`
        const inside = document.createElement('gemini-outline')

        // select which generated text to display (concise or elaborate or etc)
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
        dropdown.addEventListener('change', (e) => {

            // check if user has generated content toggled off
            if (!input.checked) return

            const selection = e.target.selectedIndex

            const current_generated = document.querySelector(`#${id}-short.selection${selection}`)
            setTimeout(()=>{
                current_generated.classList.add('active')
                current_generated.style.display = 'inline'
            }, 400)

            const all_generated = document.querySelectorAll(`#${id}-short`)
            all_generated.forEach(generated => {
                if (generated == current_generated) return

                generated.classList.remove('active')
                setTimeout(()=>{
                    generated.style.display = 'none'
                }, 400)
            })

        })

        
        // copy text button
        const copy_holder = document.createElement('gemini-outline')
        copy_holder.className = 'copy'
        
        const copy = document.createElement('gemini-copy')

        const copy_img = document.createElement('img')
        copy_img.src = await chrome.runtime.getURL('images/copy-smol.png')
        
        copy.appendChild(copy_img)
        copy_holder.appendChild(copy)
        
        copy.addEventListener('click', async () => {
            // get current selectedINdex
            const selection = dropdown.selectedIndex
            
            const generated_text = document.querySelector(`#${id}-short.selection${selection}`)
            const text_content = generated_text.textContent
            navigator.clipboard.writeText(text_content);
            
            
            copy_img.style.height = 0
            setTimeout( async () => {
                copy_img.src = await chrome.runtime.getURL('images/checkmark.png')
                copy_img.style.height = '50%'
                
                copy.onmouseout = async () => {
                    copy_img.style.height = 0
                    
                    setTimeout( async () => {
                        copy_img.src = await chrome.runtime.getURL('images/copy-smol.png')
                        copy_img.style.height = '50%'
                        copy.onmouseout = null
                    }, 400)
                }

            }, 400)
            

        })

        // create toggle element
        // custom switch: start _____________________________________
        const toggle = document.createElement('span')
        toggle.className = 'gemini-switch'
        
        const input = document.createElement('input')
        input.id = `toggle-goal-stats-${id}`
        input.class = 'gemini-switch-active'
        input.type = 'checkbox'
        
        const label = document.createElement('label')
        label.setAttribute('for', `toggle-goal-stats-${id}`)
        
        toggle.appendChild(input)
        toggle.appendChild(label)
        // custom switch: end _____________________________________

        input.addEventListener('change', () => {
            
            const selection = dropdown.selectedIndex
            // ____________________________ ON _______________________________
            if (input.checked) {
                toggle.style.setProperty('--switch-background', '#448cd0')
                
                const all_highlights = document.querySelectorAll(`#${id}`)
                all_highlights.forEach(highlight => {
                    highlight.classList.remove('active')
                })

                
                // const short = document.getElementById(`${id}-short`)
                const short = document.querySelector(`#${id}-short.selection${selection}`)
                short.classList.add('active')
                short.style.display = 'inline'
                
                // ____________________________ OFF _______________________________
            } else {
                toggle.style.setProperty('--switch-background', '#e1e1e1')
                
                // const filler = document.querySelector(`#${id}-short`)
                const filler = document.querySelector(`#${id}-short.selection${selection}`)
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

        holder.appendChild(copy_holder)

        document.body.appendChild(holder)
    }

    const attachHighlightText = async (ai_response, id, color, filter, type, start) => {
        // console.log(type, start)
        const filler = document.createElement('gemini-highlight-gen')
        // add text
        filler.innerHTML = ai_response
        
        filler.id = `${id}-short`
        filler.classList.add(`selection${type}`)
        filler.style.setProperty('--text-color', color)
        filler.style.display = 'none'

        const toggle = document.querySelector(`#${id}-toggle`)
        
        // check if we are starting with Concise or Elaborate or etc
        if(start == type ){
            // reveal generated text
            const select = toggle.querySelector('select')
            select.selectedIndex = start

            filler.classList.add('active')
            filler.classList.add('enter')
            filler.style.display = 'inline'

            setTimeout(()=>{ filler.classList.remove('enter') },1900)
            
            // hide original highlight text and display generated
            const all_highlights = document.querySelectorAll(`#${id}`)
            all_highlights.forEach(highlight => {
                highlight.classList.remove('active')
            })

        }

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

        // overwrite button onclick so it always serves a new highlight
        outline.onclick = async () => {
            const id = generateID()
            console.log('highlight:', id)

            
            
            // highlight selected range
            highlightRange(range, id);
            // remove user select highlight
            selection.removeAllRanges();
            
            attachHighlightToggle(id)

            await sendMessage({
                action: 'keywords',
                highlightedText,
            })
            
            return
            console.log('color:', most_common_color)
            await sendMessage({
                action: 'generate',
                // action: 'concise',
                highlightedText,
                id,
                most_common_color,
                starting_gen,
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
                
                case 'keywords':
                    const status_k = request.status
                    const id_k = request.id

                    if (status_k){
                        const keywords = request.keywords
                        
                    } else {
                        console.warn('shit...')
                    }


                    break
                case 'generate':
                    console.log(request)
                    const status_c = request.status
                    const id_c = request.id
                    
                    if (status_c) {
                        const concise = request.concise
                        const elaborate = request.elaborate

                        const color_c = request.color
                        const filter_c  = request.filter

                        const start = request.start

                        const dropdown = document.querySelector(`#${id_c}-toggle`)
                        const select = dropdown.querySelector('select')
                        select.selectedIndex = start

                        attachHighlightText(elaborate, id_c, color_c, filter_c, 1, start)
                        attachHighlightText(concise, id_c, color_c, filter_c, 0, start)

                        // toggle box on
                        const checkmark = dropdown.querySelector('input')
                        checkmark.checked = true
                        const event = new Event('change');
                        checkmark.dispatchEvent(event);

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