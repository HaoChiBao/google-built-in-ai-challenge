console.log('Google ai')

const main = async () => {
    const session = await ai.languageModel.create()

    const summarizer = await ai.summarizer.create();
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
    const outline = document.createElement('div')
    outline.id = 'gemini-outline'
    const image = document.createElement('img')
    image.src =  await chrome.runtime.getURL('images/gemini-stars-smol.png')

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
    

    function generateID() {
        return (
          Date.now().toString(36) + // Current timestamp in base 36
          Math.random().toString(36).substring(2, 10) // Random number in base 36
        );
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

        const rect = range.getBoundingClientRect()

        // console.log(rect)

        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.top = `${rect.top + window.scrollY - container.offsetHeight}px`;

        container.classList.add('active')


        container.onclick = async () => {
            const id = generateID()
            highlightRange(range, id);

            selection.removeAllRanges();
    
    
            // console.log("Highlighted Text:", highlightedText);
            console.log('summarizing...')
            // const context = `
            //     Here is the website context (only use context from the website): ${range.commonAncestorContainer.textContent}\n\n

            //     The following text is a highlighted portion of the context. logically summarizes the following text in a 1-3 sentences UNLESS the output is less than a sentence (the output cannot be longer than the input and you can not provide any new information that is not in the provided text):\n
            // `
            // const context = `The following text is a highlighted portion of the context. summarizes the following text by 25% - 50% UNLESS the output is less than a sentence (the output cannot be longer than the input and you can not provide any new information that is not in the provided text):\n`
            
            // const context = "Summarize the following text by 50% (be clear and concise):\n"
            // const context = "rewrite the following text shorter by 50% :\n"
            // const context = "rewrite the following text shorter (be clear and concise):\n"
            const context = "condense the following text (be concise):\n"
            
            const ai_response = await session.prompt(context + highlightedText)
            // const ai_response = await summarizer.summarize(highlightedText)
            // const ai_response = await rewriter.rewrite(highlightedText, {
                //     context: 'make text concise'
                // })

            // const ai_response = await writer.write('shorten the following:\n' + highlightedText)
            console.log(ai_response)

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

            // const html = await response.json()
            const filler = document.createElement('gemini-highlight-short')
            // filler.innerHTML = html.html
            filler.innerHTML = ai_response
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

            // console.log(range.commonAncestorContainer)
            // console.log(range.startContainer.parentElement)
            // console.log(filler)


            // METHOD 1: -----------------------------------------------------------------------------------------------------
            // let start_parent = range.startContainer
            // while (start_parent.parentElement && start_parent.parentElement != range.commonAncestorContainer){
            //     start_parent = start_parent.parentElement
            // }

            // range.commonAncestorContainer.insertBefore(filler, start_parent)
            
            
            // METHOD 2: -----------------------------------------------------------------------------------------------------
            const first_highlight = document.querySelector(`#${id}`)
            first_highlight.parentElement.insertBefore(filler, first_highlight)
            // console.log(filler)

        }
    });
    
}
main()