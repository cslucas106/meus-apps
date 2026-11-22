function isDayTime(date = new Date()) {
    const hours = date.getHours();
    // Considera dia das 6h às 18h
    return hours >= 6 && hours < 18;
}

function applyTheme(skyElement, infoElement, date = new Date()) {
    const day = isDayTime(date);
    if (day) {
        skyElement.classList.remove('night');
        skyElement.classList.add('day');
        infoElement.textContent = 'Manhã / Dia com nuvens 🌤️';
    } else {
        skyElement.classList.remove('day');
        skyElement.classList.add('night');
        infoElement.textContent = 'Noite estrelada ✨';
    }
}