const AIResponse = async (input) => {
    // replace with whatever
    try {
        const session = await ai.languageModel.create()
        const ai_response = await session.prompt(input)
        return {
            status: true,
            ai_response
        }
    } catch (e) {
        console.warn(e)
        return {
            status: false
        }
    }
}

const findKeywords = async (input) => {
    const context = `find the exact keywords and sentences. Only use text from the input and return each key/sentences with a comma in between. Use the following text:\n`
    // const context = `find the exact keywords and sentences that should be highlighted. Use the following text:\n`
    // console.log(input)
    try {
        const session = await ai.languageModel.create()
        const ai_response = await session.prompt(context + input)
        
        const keywords = []

        ai_response.split(',').forEach(keys => {
            keywords.push(keys.trim())
        });
        
        return {
            status: true,
            keywords,
        }
    } catch (e) {
        console.warn(e)
        return {
            status: false
        }
    }
}

export {AIResponse, findKeywords}