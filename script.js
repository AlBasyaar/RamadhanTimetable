// Global Variables
let alarmTime = "";
let isWorkDays = false;
let isSpecialDays = false;
let reminderTimeout = null;
let reminderCount = 0;
let selectedMinutes = 5;
let selectedMultiplier = 1;
let ramadanDisplayed = true;
let isDarkMode = false;
// Hijri Calendar Variables
let currentHijriMonth = null;
let currentHijriYear = null;
let hijriMonths = [];
let hijriDays = [];

async function initHijriCalendar() {
    try {
        const hijriToggle = document.getElementById('hijri-toggle');
        const hijriCalendar = document.getElementById('hijri-calendar');
        const prevMonth = document.getElementById('prev-month');
        const nextMonth = document.getElementById('next-month');
        const hijriMonthName = document.getElementById('hijri-month-name');
        const hijriGrid = document.getElementById('hijri-grid');
        
        
        if (!hijriToggle || !hijriCalendar || !prevMonth || !nextMonth || !hijriMonthName || !hijriGrid) {
            console.error('Missing required HTML elements for Hijri calendar');
            return;
        }
        
        // Fetch months data
        const monthsResponse = await fetch('https://api.myquran.com/v2/cal/list/months');
        const monthsData = await monthsResponse.json();
        
        // Ensure months data is in the expected format
        if (monthsData && monthsData.data && Array.isArray(monthsData.data)) {
            hijriMonths = monthsData.data;
        } else {
            // Create fallback months data if API format is different
            hijriMonths = [
                { id: 1, name: "Muharram" },
                { id: 2, name: "Safar" },
                { id: 3, name: "Rabi'ul Awal" },
                { id: 4, name: "Rabi'ul Akhir" },
                { id: 5, name: "Jumadil Awal" },
                { id: 6, name: "Jumadil Akhir" },
                { id: 7, name: "Rajab" },
                { id: 8, name: "Sya'ban" },
                { id: 9, name: "Ramadhan" },
                { id: 10, name: "Syawal" },
                { id: 11, name: "Dzulqaidah" },
                { id: 12, name: "Dzulhijjah" }
            ];
            console.log('Using fallback month data');
        }
        
        const daysResponse = await fetch('https://api.myquran.com/v2/cal/list/days');
        const daysData = await daysResponse.json();
        
        
        if (daysData && daysData.data && Array.isArray(daysData.data)) {
            hijriDays = daysData.data;
        } else {
            
            hijriDays = [
                { id: 0, name: "Ahad" },
                { id: 1, name: "Senin" },
                { id: 2, name: "Selasa" },
                { id: 3, name: "Rabu" },
                { id: 4, name: "Kamis" },
                { id: 5, name: "Jum'at" },
                { id: 6, name: "Sabtu" }
            ];
            console.log('Using fallback day data');
        }
        
        // Get current Hijri date
        const todayResponse = await fetch('https://api.myquran.com/v2/cal/hijr/?adj=-1');
        const todayData = await todayResponse.json();
        
        if (todayData && todayData.data) {
            currentHijriMonth = parseInt(todayData.data.month) || 1;
            currentHijriYear = parseInt(todayData.data.year) || 1446; // Update to 2025 Hijri year
        } else {
            // Default to March 2025 in Hijri if API fails
            currentHijriMonth = 9; // Ramadan for March 2025
            currentHijriYear = 1446; // 1446 H corresponds to 2025 CE
            console.log('Using default date for March 2025');
        }
        
        // Generate calendar for current month
        generateHijriCalendar(currentHijriMonth, currentHijriYear);
        
        // Update the header
        updateHijriHeader();
        
        // Add event listeners for navigation
        if (prevMonth) {
            prevMonth.addEventListener('click', navigateToPrevMonth);
        }
        if (nextMonth) {
            nextMonth.addEventListener('click', navigateToNextMonth);
        }
    } catch (error) {
        console.error('Error initializing Hijri calendar:', error);
        if (window.Swal) {
            Swal.fire({
                title: 'Error',
                text: 'Gagal memuat kalender Hijriah. Periksa koneksi internet Anda.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
}

// Function to navigate to previous month
function navigateToPrevMonth() {
    currentHijriMonth--;
    if (currentHijriMonth < 1) {
        currentHijriMonth = 12;
        currentHijriYear--;
    }
    generateHijriCalendar(currentHijriMonth, currentHijriYear);
    updateHijriHeader();
}

// Function to navigate to next month
function navigateToNextMonth() {
    currentHijriMonth++;
    if (currentHijriMonth > 12) {
        currentHijriMonth = 1;
        currentHijriYear++;
    }
    generateHijriCalendar(currentHijriMonth, currentHijriYear);
    updateHijriHeader();
}

// Function to update Hijri header with current month and year
function updateHijriHeader() {
    const hijriMonthName = document.getElementById('hijri-month-name');
    if (!hijriMonthName) return;
    
    let monthName = '';
    
    // Check if hijriMonths is an array and has the find method
    if (Array.isArray(hijriMonths) && typeof hijriMonths.find === 'function') {
        const monthObj = hijriMonths.find(month => month.id === currentHijriMonth);
        if (monthObj) {
            monthName = monthObj.name;
        }
    } else {
        // Fallback for non-array hijriMonths or if find is not available
        const monthNames = ["Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", 
                          "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqaidah", "Dzulhijjah"];
        monthName = monthNames[currentHijriMonth - 1] || '';
    }
    
    hijriMonthName.textContent = `${monthName} ${currentHijriYear}H`;
}

// Define special Islamic days/events - Enhanced list
const hijriSpecialDays = [
    // Muharram (Month 1)
    { month: 1, day: 1, name: "Tahun Baru Hijriah" },
    { month: 1, day: 10, name: "Hari Asyura" },
    
    // Safar (Month 2)
    { month: 2, day: 28, name: "Akhir Safar" },
    
    // Rabi'ul Awal (Month 3)
    { month: 3, day: 12, name: "Maulid Nabi Muhammad" },
    
    // Rajab (Month 7)
    { month: 7, day: 27, name: "Isra Mi'raj" },
    
    // Sya'ban (Month 8)
    { month: 8, day: 15, name: "Nisfu Sya'ban" },
    
    // Ramadhan (Month 9)
    { month: 9, day: 1, name: "Awal Ramadhan" },
    { month: 9, day: 17, name: "Nuzulul Qur'an" },
    { month: 9, day: 21, name: "Lailatul Qadr (perkiraan)" },
    { month: 9, day: 23, name: "Lailatul Qadr (perkiraan)" },
    { month: 9, day: 25, name: "Lailatul Qadr (perkiraan)" },
    { month: 9, day: 27, name: "Lailatul Qadr (perkiraan)" },
    { month: 9, day: 29, name: "Lailatul Qadr (perkiraan)" },
    
    // Syawal (Month 10)
    { month: 10, day: 1, name: "Idul Fitri" },
    { month: 10, day: 2, name: "Idul Fitri (Hari Kedua)" },
    { month: 10, day: 3, name: "Idul Fitri (Hari Ketiga)" },
    
    // Dzulhijjah (Month 12)
    { month: 12, day: 8, name: "Hari Tarwiyah" },
    { month: 12, day: 9, name: "Hari Arafah" },
    { month: 12, day: 10, name: "Idul Adha" },
    { month: 12, day: 11, name: "Hari Tasyrik 1" },
    { month: 12, day: 12, name: "Hari Tasyrik 2" },
    { month: 12, day: 13, name: "Hari Tasyrik 3" }
];

// Function to check if a day is special
function isSpecialDay(month, day) {
    return hijriSpecialDays.find(specialDay => 
        specialDay.month === month && specialDay.day === day
    );
}

// Enhanced version of generateHijriCalendar function
async function generateHijriCalendar(month, year) {
    const hijriGrid = document.getElementById('hijri-grid');
    if (!hijriGrid) return;
    
    try {
        // Fetch the calendar data for specific month and year
        const calendarResponse = await fetch(`https://api.myquran.com/v2/cal/hijr/${year}/${month}`);
        const calendarData = await calendarResponse.json();
        
        let calendar = [];
        
        // Handle different possible API response formats
        if (calendarData.data && calendarData.data.calendar && Array.isArray(calendarData.data.calendar)) {
            calendar = calendarData.data.calendar;
        } else if (calendarData.data && Array.isArray(calendarData.data)) {
            calendar = calendarData.data;
        } else {
            // Generate fallback calendar if API format is unexpected
            const daysInMonth = 30; // Approximation for most Hijri months
            const firstDayOfWeek = new Date().getDay(); // Use current day of week
            
            for (let i = 1; i <= daysInMonth; i++) {
                const today = new Date();
                calendar.push({
                    day: i,
                    weekday: (firstDayOfWeek + i - 1) % 7,
                    gregorian: {
                        date: `${today.getDate() - today.getDay() + i}/${today.getMonth() + 1}`
                    },
                    events: []
                });
            }
            console.log('Using fallback calendar data');
        }
        
        hijriGrid.innerHTML = '';
        
        // Get current date for highlighting today
        let todayHijriDate = 0;
        let todayHijriMonth = 0;
        let todayHijriYear = 0;
        
        try {
            const todayResponse = await fetch('https://api.myquran.com/v2/cal/hijr/?adj=-1');
            const todayData = await todayResponse.json();
            
            if (todayData && todayData.data) {
                todayHijriDate = parseInt(todayData.data.day) || 0;
                todayHijriMonth = parseInt(todayData.data.month) || 0;
                todayHijriYear = parseInt(todayData.data.year) || 0;
            }
        } catch (e) {
            console.log('Could not fetch today\'s Hijri date:', e);
            // Set to March 11, 2025 in Hijri as fallback (approximately Ramadan 12, 1446)
            todayHijriDate = 12;
            todayHijriMonth = 9;
            todayHijriYear = 1446;
        }
        
        // Determine the first day of the month (0 = Sunday, 1 = Monday, etc.)
        const firstDay = calendar.length > 0 ? (calendar[0].weekday || 0) : 0;
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'hijri-day empty';
            hijriGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        calendar.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'hijri-day';
            
            // Check if this is today - highlight in green
            if (day.day === todayHijriDate && 
                month === todayHijriMonth && 
                year === todayHijriYear) {
                dayDiv.classList.add('today');
                // Update to use green color for today
                dayDiv.style.backgroundColor = '#e8f5e9';
                dayDiv.style.border = '2px solid #4caf50';
                dayDiv.style.color = '#2e7d32';
                dayDiv.style.fontWeight = 'bold';
            }
            
            // Check if this is a special day
            const specialDay = isSpecialDay(month, day.day);
            if (specialDay) {
                dayDiv.classList.add('special-day');
                
                // Add special day information
                const eventDiv = document.createElement('div');
                eventDiv.className = 'hijri-event';
                eventDiv.textContent = specialDay.name;
                eventDiv.style.backgroundColor = '#e3f2fd';
                eventDiv.style.color = '#1565c0';
                eventDiv.style.padding = '2px 4px';
                eventDiv.style.borderRadius = '3px';
                eventDiv.style.fontSize = '10px';
                eventDiv.style.marginTop = '2px';
                dayDiv.appendChild(eventDiv);
            }
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'hijri-day-number';
            dayNumber.textContent = day.day;
            
            const gregorianDate = document.createElement('div');
            gregorianDate.className = 'gregorian-date';
            gregorianDate.style.fontSize = '10px';
            gregorianDate.style.color = '#757575';
            
            // Check if gregorian date exists in the expected format
            if (day.gregorian && day.gregorian.date) {
                gregorianDate.textContent = day.gregorian.date;
            } else if (day.gregorian) {
                // Try to handle different possible formats
                gregorianDate.textContent = typeof day.gregorian === 'string' ? 
                    day.gregorian : 'N/A';
            } else {
                gregorianDate.textContent = 'N/A';
            }
            
            // Add API-provided events if available and not already a special day
            if (!specialDay && day.events && Array.isArray(day.events) && day.events.length > 0) {
                dayDiv.classList.add('special-day');
                
                const eventDiv = document.createElement('div');
                eventDiv.className = 'hijri-event';
                eventDiv.style.backgroundColor = '#fff8e1';
                eventDiv.style.color = '#ff8f00'; 
                eventDiv.style.padding = '2px 4px';
                eventDiv.style.borderRadius = '3px';
                eventDiv.style.fontSize = '10px';
                eventDiv.style.marginTop = '2px';
                
                if (typeof day.events[0] === 'object' && day.events[0].name) {
                    eventDiv.textContent = day.events[0].name;
                } else if (typeof day.events[0] === 'string') {
                    eventDiv.textContent = day.events[0];
                } else {
                    eventDiv.textContent = 'Event';
                }
                
                dayDiv.appendChild(eventDiv);
            }
            
            dayDiv.appendChild(dayNumber);
            dayDiv.appendChild(gregorianDate);
            hijriGrid.appendChild(dayDiv);
        });
        
        // Add legend for important dates at the bottom of the calendar
        addCalendarLegend(hijriGrid);
        
    } catch (error) {
        console.error('Error generating Hijri calendar:', error);
        hijriGrid.innerHTML = '<div class="error-message">Gagal memuat kalender. Periksa koneksi internet Anda.</div>';
        
        if (window.Swal) {
            Swal.fire({
                title: 'Error',
                text: 'Gagal memuat kalender untuk bulan ini. Periksa koneksi internet Anda.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
}

// Add legend for important dates
function addCalendarLegend(container) {
    const legendDiv = document.createElement('div');
    legendDiv.className = 'hijri-legend';
    legendDiv.style.marginTop = '15px';
    legendDiv.style.padding = '10px';
    legendDiv.style.backgroundColor = '#f5f5f5';
    legendDiv.style.borderRadius = '5px';
    legendDiv.style.fontSize = '12px';
    
    const legendTitle = document.createElement('div');
    legendTitle.textContent = 'Tanggal Penting Bulan Ini:';
    legendTitle.style.fontWeight = 'bold';
    legendTitle.style.marginBottom = '5px';
    
    legendDiv.appendChild(legendTitle);
    
    // Get all special days for the current month
    const specialDaysThisMonth = hijriSpecialDays.filter(day => day.month === currentHijriMonth);
    
    if (specialDaysThisMonth.length === 0) {
        const noEvents = document.createElement('div');
        noEvents.textContent = 'Tidak ada tanggal penting khusus bulan ini.';
        noEvents.style.fontStyle = 'italic';
        noEvents.style.color = '#757575';
        legendDiv.appendChild(noEvents);
    } else {
        specialDaysThisMonth.forEach(specialDay => {
            const eventItem = document.createElement('div');
            eventItem.style.display = 'flex';
            eventItem.style.alignItems = 'center';
            eventItem.style.marginBottom = '3px';
            
            const colorDot = document.createElement('div');
            colorDot.style.width = '8px';
            colorDot.style.height = '8px';
            colorDot.style.backgroundColor = '#e3f2fd';
            colorDot.style.border = '1px solid #1565c0';
            colorDot.style.borderRadius = '50%';
            colorDot.style.marginRight = '5px';
            
            const eventText = document.createElement('div');
            eventText.textContent = `${specialDay.day} - ${specialDay.name}`;
            
            eventItem.appendChild(colorDot);
            eventItem.appendChild(eventText);
            legendDiv.appendChild(eventItem);
        });
    }
    
    // Add today indicator to legend
    const todayLegend = document.createElement('div');
    todayLegend.style.marginTop = '10px';
    todayLegend.style.display = 'flex';
    todayLegend.style.alignItems = 'center';
    
    const todayDot = document.createElement('div');
    todayDot.style.width = '10px';
    todayDot.style.height = '10px';
    todayDot.style.backgroundColor = '#e8f5e9';
    todayDot.style.border = '2px solid #4caf50';
    todayDot.style.borderRadius = '50%';
    todayDot.style.marginRight = '5px';
    
    const todayText = document.createElement('div');
    todayText.textContent = 'Hari ini';
    todayText.style.fontWeight = 'bold';
    
    todayLegend.appendChild(todayDot);
    todayLegend.appendChild(todayText);
    legendDiv.appendChild(todayLegend);
    
    container.parentNode.appendChild(legendDiv);
}

// Function to toggle Hijri calendar visibility
function toggleHijriCalendar() {
    const calendar = document.getElementById('hijri-calendar');
    const toggleButton = document.getElementById('hijri-toggle');
    
    if (!calendar || !toggleButton) return;
    
    const isDisplayed = calendar.style.display !== 'none';
    
    if (isDisplayed) {
        calendar.style.display = 'none';
        toggleButton.textContent = 'Tampilkan';
    } else {
        calendar.style.display = 'block';
        toggleButton.textContent = 'Sembunyikan';
    }
}

// Add styles for the calendar
function addHijriCalendarStyles() {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        .hijri-calendar {
            font-family: Arial, sans-serif;
            max-width: 100%;
            margin: 0 auto;
            padding: 15px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .hijri-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .hijri-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        
        #hijri-toggle {
            padding: 5px 10px;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .hijri-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .nav-button {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 5px 10px;
            cursor: pointer;
        }
        
        .hijri-month-name {
            font-size: 16px;
            font-weight: bold;
            color: #444;
        }
        
        .days-header {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 8px 0;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .hijri-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
        }
        
        .hijri-day {
            border: 1px solid #eee;
            border-radius: 4px;
            padding: 5px;
            min-height: 60px;
            text-align: center;
            position: relative;
        }
        
        .hijri-day.empty {
            background-color: #f9f9f9;
            border: none;
        }
        
        .hijri-day-number {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .gregorian-date {
            font-size: 10px;
            color: #777;
        }
        
        .info-text {
            margin-top: 15px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        
        .error-message {
            color: #d32f2f;
            text-align: center;
            padding: 20px;
        }
    `;
    document.head.appendChild(styleTag);
}

// Add the initialization to DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function() {
    // Add styles
    addHijriCalendarStyles();
    
    // Safely check if hijri-toggle element exists before adding event listener
    const hijriToggle = document.getElementById("hijri-toggle");
    
    if (hijriToggle) {
        // Only add event listener if element exists
        hijriToggle.addEventListener("click", toggleHijriCalendar);
    } else {
        // Log helpful message if element is missing
        console.log("Element with ID 'hijri-toggle' not found in document");
    }
    
    // Initialize Hijri calendar with safety checks
    initHijriCalendarSafely();
});

// Safer version of initHijriCalendar that won't crash if elements are missing
function initHijriCalendarSafely() {
    try {
        // Check if the required elements exist first
        const requiredElements = [
            'hijri-calendar',
            'hijri-month-name',
            'hijri-grid'
        ];
        
        const missingElements = requiredElements.filter(id => 
            document.getElementById(id) === null
        );
        
        if (missingElements.length > 0) {
            console.log("Hijri calendar can't initialize - missing elements:", missingElements.join(', '));
            return; // Exit early if elements are missing
        }
        
        // If all elements exist, proceed with initialization
        initHijriCalendar();
    } catch (error) {
        console.error("Error safely initializing Hijri calendar:", error);
    }
}
// Prayer times data for different locations
const prayerTimesByLocation = {
    jakarta: {
        subuh: "04:33",
        dzuhur: "11:51",
        ashar: "15:12",
        maghrib: "17:57",
        isya: "19:06"
    },
    bandung: {
        subuh: "04:38",
        dzuhur: "11:56",
        ashar: "15:17",
        maghrib: "18:02",
        isya: "19:11"
    },
    surabaya: {
        subuh: "04:22",
        dzuhur: "11:40",
        ashar: "15:01",
        maghrib: "17:46",
        isya: "18:55"
    },
    yogyakarta: {
        subuh: "04:30",
        dzuhur: "11:48",
        ashar: "15:09",
        maghrib: "17:54",
        isya: "19:03"
    },
    makassar: {
        subuh: "04:47",
        dzuhur: "12:05",
        ashar: "15:26",
        maghrib: "18:11",
        isya: "19:20"
    }
};

// Prayer alarms state
const prayerAlarms = {
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true
};

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
    // Theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-theme");
        isDarkMode = document.body.classList.contains("dark-theme");
        
        // Update icon
        if (isDarkMode) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Save preference to localStorage
        localStorage.setItem("darkMode", isDarkMode);
    });
    
    // Load theme preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    if (savedDarkMode) {
        document.body.classList.add("dark-theme");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        isDarkMode = true;
    }
    
    // Alarm setup
    document.getElementById("set-alarm-button").addEventListener("click", setAlarm);
    
    // Reminder setup
    document.getElementById("set-reminder-button").addEventListener("click", setReminder);
    
    // Location change
    document.getElementById("location-select").addEventListener("change", updatePrayerTimes);
    
    // Ramadan calendar toggle
    document.getElementById("ramadan-toggle").addEventListener("click", toggleRamadanCalendar);
    
    // Initialize prayer times
    updatePrayerTimes();
    
    // Generate Ramadan calendar
    generateRamadanCalendar();
});

function setAlarm() {
    alarmTime = document.getElementById("alarm-time").value;
    isWorkDays = document.getElementById("work-days").checked;
    isSpecialDays = document.getElementById("special-days").checked;
    
    if (!alarmTime) {
        Swal.fire({
            title: 'Eror',
            text: 'Harap pilih waktu alarm',
            icon: 'error',
            timer: 3000,
            showConfirmButton: false
        });
        return;
    }
    
    Swal.fire({
        title: 'Berhasil!',
        text: 'Alarm telah diatur untuk ' + alarmTime,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
    });
}

function setReminder() {
    selectedMinutes = parseInt(document.getElementById("minutes-select").value);
    selectedMultiplier = parseInt(document.getElementById("multiplier-select").value);
    
    // Clear existing reminder
    if (reminderTimeout) {
        clearTimeout(reminderTimeout);
        reminderTimeout = null;
        reminderCount = 0;
    }
    
    // Start the reminder
    reminderCount = 0;
    startReminder();
    
    Swal.fire({
        title: 'Pengingat Diatur',
        text: `Anda akan diingatkan setiap ${selectedMinutes} menit sebanyak ${selectedMultiplier} kali`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
    });
}

function startReminder() {
    if (reminderCount < selectedMultiplier) {
        reminderTimeout = setTimeout(function() {
            const alarmSound = document.getElementById("alarm-sound");
            alarmSound.play();
            
            setTimeout(function() {
                alarmSound.pause();
                alarmSound.currentTime = 0;
            }, 5000);
            
            Swal.fire({
                title: 'Waktunya!',
                text: `Pengingat #${reminderCount + 1} dari ${selectedMultiplier}`,
                icon: 'info',
                timer: 5000,
                showConfirmButton: false
            });
            
            reminderCount++;
            startReminder();
        }, selectedMinutes * 60 * 1000);
    }
}

function updatePrayerTimes() {
    const location = document.getElementById('location-select').value;
    const times = prayerTimesByLocation[location];
    
    document.getElementById('subuh-time').textContent = times.subuh;
    document.getElementById('dzuhur-time').textContent = times.dzuhur;
    document.getElementById('ashar-time').textContent = times.ashar;
    document.getElementById('maghrib-time').textContent = times.maghrib;
    document.getElementById('isya-time').textContent = times.isya;
    
    // Update prayer alarm toggles
    document.getElementById('subuh-toggle').addEventListener('change', function() {
        prayerAlarms.subuh = this.checked;
    });
    document.getElementById('dzuhur-toggle').addEventListener('change', function() {
        prayerAlarms.dzuhur = this.checked;
    });
    document.getElementById('ashar-toggle').addEventListener('change', function() {
        prayerAlarms.ashar = this.checked;
    });
    document.getElementById('maghrib-toggle').addEventListener('change', function() {
        prayerAlarmsprayerAlarms.maghrib = this.checked;
    });
    document.getElementById('isya-toggle').addEventListener('change', function() {
        prayerAlarms.isya = this.checked;
    });
}

function checkPrayerTimes() {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    
    const location = document.getElementById('location-select').value;
    const times = prayerTimesByLocation[location];
    
    if (currentTime === times.subuh && prayerAlarms.subuh) {
        playAdzan('Subuh');
    } else if (currentTime === times.dzuhur && prayerAlarms.dzuhur) {
        playAdzan('Dzuhur');
    } else if (currentTime === times.ashar && prayerAlarms.ashar) {
        playAdzan('Ashar');
    } else if (currentTime === times.maghrib && prayerAlarms.maghrib) {
        playAdzan('Maghrib');
    } else if (currentTime === times.isya && prayerAlarms.isya) {
        playAdzan('Isya');
    }
}

function playAdzan(prayerName) {
    const adzanSound = document.getElementById("adzan-sound");
    adzanSound.play();
    
    Swal.fire({
        title: 'Waktunya Sholat!',
        text: `Adzan ${prayerName} telah berkumandang`,
        icon: 'info',
        showConfirmButton: true,
        confirmButtonText: 'Matikan Adzan',
    }).then((result) => {
        if (result.isConfirmed) {
            adzanSound.pause();
            adzanSound.currentTime = 0;
        }
    });
}

function toggleRamadanCalendar() {
    const calendar = document.getElementById('ramadan-calendar');
    const toggleButton = document.getElementById('ramadan-toggle');
    
    ramadanDisplayed = !ramadanDisplayed;
    
    if (ramadanDisplayed) {
        calendar.style.display = 'block';
        toggleButton.textContent = 'Sembunyikan';
    } else {
        calendar.style.display = 'none';
        toggleButton.textContent = 'Tampilkan';
    }
}

function generateRamadanCalendar() {
    // 2025 Ramadan details
    const ramadanStart = new Date(2025, 2, 1); // March 1, 2025 (approximate)
    const totalDays = 30;
    const startDay = ramadanStart.getDay(); // Day of week (0-6)
    const today = new Date();
    
    const grid = document.getElementById('ramadan-grid');
    grid.innerHTML = '';
    
    // Add empty cells for days before Ramadan starts
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'ramadan-day';
        emptyDay.innerHTML = '&nbsp;';
        grid.appendChild(emptyDay);
    }
    
    // Add Ramadan days
    for (let i = 1; i <= totalDays; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'ramadan-day';
        
        // Check if this is today
        const ramadanDate = new Date(ramadanStart);
        ramadanDate.setDate(ramadanStart.getDate() + i - 1);
        
        if (ramadanDate.getDate() === today.getDate() && 
            ramadanDate.getMonth() === today.getMonth() && 
            ramadanDate.getFullYear() === today.getFullYear()) {
            dayDiv.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'ramadan-day-number';
        dayNumber.textContent = i;
        
        const gregorianDate = document.createElement('div');
        gregorianDate.className = 'gregorian-date';
        gregorianDate.textContent = `${ramadanDate.getDate()}/${ramadanDate.getMonth() + 1}`;
        
        dayDiv.appendChild(dayNumber);
        dayDiv.appendChild(gregorianDate);
        grid.appendChild(dayDiv);
    }
}

function openTab(event, tabName) {
    // Ambil semua elemen dengan class "tab-content" dan sembunyikan
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((tab) => {
        tab.classList.remove("active");
    });

    // Ambil semua elemen dengan class "tab" dan hapus class "active"
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
        tab.classList.remove("active");
    });

    // Tampilkan tab yang dipilih dan tambahkan class "active" ke button yang diklik
    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");
}

function runClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Update analog clock
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;
    
    document.getElementById("hour").style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    document.getElementById("minute").style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    document.getElementById("second").style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
    
    // Update digital clock
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    document.getElementById("wib-time").textContent = 
       `${formattedHours}:${formattedMinutes}:${formattedSeconds} WIB`;
    
    // Check for alarms
    const currentTime = `${formattedHours}:${formattedMinutes}`;
    
    // Check custom alarm
    if (alarmTime === currentTime && seconds === 0) {
        const today = now.getDay(); // 0 (Sunday) to 6 (Saturday)
        const isWeekday = today >= 1 && today <= 5; // Monday to Friday
        
        // Check if workdays is enabled and today is a weekday
        if ((isWorkDays && isWeekday) || !isWorkDays) {
            // Check if special days is enabled (this would need custom logic for special days)
            if (isSpecialDays) {
                // Logic for special days would go here
                // For now, we'll just play the alarm
                const alarmSound = document.getElementById("alarm-sound");
                alarmSound.play();
                
                Swal.fire({
                    title: 'Alarm!',
                    text: 'Waktunya untuk bangun/beraktivitas!',
                    icon: 'warning',
                    showConfirmButton: true,
                    confirmButtonText: 'Matikan',
                }).then((result) => {
                    if (result.isConfirmed) {
                        alarmSound.pause();
                        alarmSound.currentTime = 0;
                    }
                });
            } else {
                // Normal alarm
                const alarmSound = document.getElementById("alarm-sound");
                alarmSound.play();
                
                Swal.fire({
                    title: 'Alarm!',
                    text: 'Waktunya untuk bangun/beraktivitas!',
                    icon: 'warning',
                    showConfirmButton: true,
                    confirmButtonText: 'Matikan',
                }).then((result) => {
                    if (result.isConfirmed) {
                        alarmSound.pause();
                        alarmSound.currentTime = 0;
                    }
                });
            }
        }
    }
    
   
    if (seconds === 0) {
        checkPrayerTimes();
    }
}

// Run the clock every second
setInterval(runClock, 1000);

// Start the clock immediately
runClock();

