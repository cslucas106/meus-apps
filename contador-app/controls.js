document.addEventListener('DOMContentLoaded', () => {
    const btnIncrement = document.getElementById('btn-increment');
    const btnDecrement = document.getElementById('btn-decrement');
    const btnReset = document.getElementById('btn-reset');

    btnIncrement.addEventListener('click', () => {
        state.updateCount(state.count + 1, `Incrementado para ${state.count + 1}`);
    });

    btnDecrement.addEventListener('click', () => {
        state.updateCount(state.count - 1, `Decrementado para ${state.count - 1}`);
    });

    btnReset.addEventListener('click', () => {
        state.updateCount(0, 'Contador zerado');
    });
});