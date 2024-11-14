const main = async () => {
    const response = await fetch('http://localhost:8080/markdown', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: 'test'
        })
    })
    console.log(await response.json())
}
main()