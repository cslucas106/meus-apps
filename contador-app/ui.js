const ui = {
    display: document.getElementById('counter-display'),
    historyList: document.getElementById('history-list'),

    render(currentState) {
        this.display.textContent = currentState.count;
        
        this.historyList.innerHTML = '';
        currentState.history.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            this.historyList.appendChild(li);
        });
    }
};

document.addEventListener('stateChanged', (e) => {
    ui.render(e.detail);
});