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

