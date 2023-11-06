class Level {

    static load_level(map, level) {
        fetch('./sources/levels/' + map + '-' + level + '.json')
        .then(response => response.json())
        .then(json => {
            console.log(json.title)
            console.log(json.questions)
        })
    }
}

export { Level };
