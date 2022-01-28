const loadComments = async () => {
    console.log('webpage loads');

    const response = await fetch('/comments')
    const data = await response.json()

    const tableBody = document.getElementById('comments')

    for (let name in data) {
        const row = document.createElement('tr');
        const nameTd = document.createElement('td');
        const commentTd = document.createElement('td');

        nameTd.innerText = name
        commentTd.innerText = data[name]

        row.append(nameTd)
        row.append(commentTd)
        tableBody.append(row)
    }

}