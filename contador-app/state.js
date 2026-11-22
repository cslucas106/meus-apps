const state = {
    count: 0,
    history: [],

    updateCount(newVal, actionDescription) {
        this.count = newVal;
        const time = new Date().toLocaleTimeString();
        this.history.unshift(`${actionDescription} (${time})`);
        if (this.history.length > 10) {
            this.history.pop();
        }
        document.dispatchEvent(new CustomEvent('stateChanged', { detail: this }));
    }
};