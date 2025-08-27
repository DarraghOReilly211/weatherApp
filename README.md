# 🌦️ Simple Weather App

A lightweight, browser-based weather application built with **vanilla JavaScript**, **HTML5**, and **CSS3**.  
It uses the [Open-Meteo API](https://open-meteo.com/) to provide real-time weather data without requiring an API key.  

This project is featured in my portfolio as an example of clean, modular front-end code and API integration.

---

## ✨ Features

- 🔍 **Search any city**: Enter a city name to get the latest weather info.  
- 🌍 **Preloaded cities**: Weather for multiple major cities is shown automatically when the app loads.  
- 🎨 **Dynamic UI**: Weather cards update with icons, themes, and labels depending on the weather conditions.  
- ⚡ **Fast & lightweight**: No backend required, runs entirely in the browser.  
- ♿ **Accessible**: Includes semantic HTML and ARIA labels.  

---

## 🏙️ Preloaded Cities

The app loads these cities on startup:

- Dublin 🇮🇪  
- Cavan 🇮🇪  
- Galway 🇮🇪  
- London 🇬🇧  
- New York 🇺🇸  
- Tokyo 🇯🇵  
- Sydney 🇦🇺  
- Paris 🇫🇷  

You can add or remove cities by editing the [`cities.js`](./cities.js) file:

```js
export const cities = [
  "Dublin",
  "Cavan",
  "Galway",
  "London",
  "New York",
  "Tokyo",
  "Sydney",
  "Paris"
];
```

---

## 🚀 How It Works

1. **Geocoding**  
   - The app first queries Open-Meteo’s geocoding API to fetch latitude/longitude for a city name.  

2. **Weather Forecast**  
   - Using those coordinates, it retrieves the current weather conditions.  

3. **UI Rendering**  
   - Data is mapped into user-friendly weather cards with emoji icons and descriptions.  

---

## 📂 Project Structure

```
.
├── index.js        # Main logic (fetches data, renders UI)
├── cities.js       # Predefined cities to display
├── mainPage.html   # Main HTML page
└── /static/CSS/    # Styles
```

---

## ⚙️ Setup & Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/simple-weather-app.git
   cd simple-weather-app
   ```

2. Open `mainPage.html` in your browser.  
   *(No build tools or server required.)*  

---

## 📌 Portfolio Highlight

This project demonstrates:

- API integration with asynchronous JavaScript (`async/await`)  
- Clean modular structure (`index.js` + `cities.js`)  
- DOM manipulation & dynamic rendering  
- Error handling for failed API requests  

---

## 📜 License

MIT License – feel free to use and modify.  
