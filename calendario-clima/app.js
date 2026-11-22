document.addEventListener('DOMContentLoaded', () => {
    const skyEl = document.getElementById('sky');
    const modeInfoEl = document.getElementById('mode-info');
    const monthYearEl = document.getElementById('month-year');
    const daysContainer = document.getElementById('days-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    const selectedDateTitle = document.getElementById('selected-date-title');
    const eventInput = document.getElementById('event-input');
    const addEventBtn = document.getElementById('add-event-btn');
    const eventList = document.getElementById('event-list');

    let currentDate = new Date();
    let selectedDate = new Date();
    let events = getStoredEvents();

    // Aplica o tema com base na hora
    applyTheme(skyEl, modeInfoEl);
    setInterval(() => applyTheme(skyEl, modeInfoEl), 60000);

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearEl.textContent = `${MONTH_NAMES[month]} ${year}`;
        daysContainer.innerHTML = '';

        const days = getMonthData(year, month);
        const todayKey = formatDateKey(new Date());
        const selectedKey = formatDateKey(selectedDate);

        days.forEach(day => {
            const cell = document.createElement('div');
            cell.classList.add('day-cell');

            if (!day) {
                cell.classList.add('empty');
                daysContainer.appendChild(cell);
                return;
            }

            cell.textContent = day.getDate();
            const dayKey = formatDateKey(day);

            if (dayKey === todayKey) {
                cell.classList.add('today');
            }

            if (dayKey === selectedKey) {
                cell.classList.add('selected');
            }

            if (events[dayKey] && events[dayKey].length > 0) {
                cell.classList.add('has-event');
            }

            cell.addEventListener('click', () => {
                selectedDate = new Date(day);
                renderCalendar();
                renderEvents();
            });

            daysContainer.appendChild(cell);
        });

        renderEventsTitle();
    }

    function renderEventsTitle() {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        selectedDateTitle.textContent = `Eventos de ${selectedDate.toLocaleDateString('pt-BR', options)}`;
    }

    function renderEvents() {
        renderEventsTitle();
        eventList.innerHTML = '';
        const dayKey = formatDateKey(selectedDate);
        const dayEvents = events[dayKey] || [];

        dayEvents.forEach((evText, index) => {
            const li = document.createElement('li');
            li.textContent = evText;

            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', () => {
                events[dayKey].splice(index, 1);
                if (events[dayKey].length === 0) {
                    delete events[dayKey];
                }
                saveStoredEvents(events);
                renderCalendar();
                renderEvents();
            });

            li.appendChild(delBtn);
            eventList.appendChild(li);
        });
    }

    addEventBtn.addEventListener('click', () => {
        const text = eventInput.value.trim();
        if (!text) return;

        const dayKey = formatDateKey(selectedDate);
        if (!events[dayKey]) {
            events[dayKey] = [];
        }
        events[dayKey].push(text);
        saveStoredEvents(events);

        eventInput.value = '';
        renderCalendar();
        renderEvents();
    });

    eventInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addEventBtn.click();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
    renderEvents();
});