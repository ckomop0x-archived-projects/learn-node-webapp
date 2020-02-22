function autocomplete(input, latInput, lngInput) {
    console.log(arguments)
    if(!input) return;

    const dropdown = new google.maps.places.Autocomplete(input);
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace()
        console.log(place)
        latInput.value = place.geometry.location.lat()
        lngInput.value = place.geometry.location.lng()
    })

    // if someone hits Enter don't submit the form
    input.on('keydown', (evt) => {
        if (evt.key === 'Enter') {
            evt.preventDefault()
        }
    })
}

export default autocomplete;
