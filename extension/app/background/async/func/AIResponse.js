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

export default AIResponse