function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const date = now.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  document.getElementById("clock-time").textContent = `${hours}:${minutes}`;
  document.getElementById("clock-date").textContent = date;
}

setInterval(updateClock, 1000);
window.onload = function () {
  updateClock();
  fetchWeather();
  loadNotes();
};

function makeTitleEditable() {
  const title = document.getElementById("page-title");
  title.contentEditable = true;
  title.focus();
  title.addEventListener("blur", () => {
    title.contentEditable = false;
  });
}

function openModal() {
  document.getElementById("linkModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("linkModal").style.display = "none";
}

function addLink() {
  const linkTitle = document.getElementById("modal-link-title").value;
  let linkUrl = document.getElementById("modal-link-url").value.trim();
  if (linkTitle && linkUrl) {
    if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
      linkUrl = "https://" + linkUrl;
    }
    const linkList = document.getElementById("link-list");
    const li = document.createElement("li");
    li.innerHTML = `<a href="${linkUrl}" target="_blank">${linkTitle}</a> <span class="remove-link" onclick="removeLink(this)"><img src="IMAGES/delete.svg" alt="" style="width: 13px"
              /></span>`;
    linkList.appendChild(li);
    document.getElementById("modal-link-title").value = "";
    document.getElementById("modal-link-url").value = "";
    closeModal();
  }
}

function removeLink(element) {
  element.parentElement.remove();
}

function removeLink(element) {
  element.parentElement.remove();
}

function fetchWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const apiKey = "8d6925bba4534b1fb81103127252503";
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&lang=sv`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("API-svar:", data);

          if (data.error) {
            console.error("API Error:", data.error);
            document.getElementById("weather-info").innerHTML =
              "Fel vid hämtning av väderdata: " + data.error.message;
            return;
          }

          if (data.forecast && data.forecast.forecastday) {
            const today = data.forecast.forecastday[0];
            const tomorrow = data.forecast.forecastday[1];
            const dayAfter = data.forecast.forecastday[2];

            function getWeekday(dateString) {
              const date = new Date(dateString);
              const weekdays = [
                "Söndag",
                "Måndag",
                "Tisdag",
                "Onsdag",
                "Torsdag",
                "Fredag",
                "Lördag",
              ];
              return weekdays[date.getDay()];
            }

            document.getElementById("weather-info").innerHTML = `
            <div>
              <strong>Idag:</strong> ${today.day.avgtemp_c}°C, ${
              today.day.condition.text
            }
            </div>
            <div>
              <strong>Imorgon:</strong> ${tomorrow.day.avgtemp_c}°C, ${
              tomorrow.day.condition.text
            }
            </div>
            <div>
              <strong>${getWeekday(dayAfter.date)}: </strong> ${
              dayAfter.day.avgtemp_c
            }°C, ${dayAfter.day.condition.text}
            </div>
          `;
          } else {
            document.getElementById("weather-info").innerHTML =
              "Kunde inte hämta väderdata korrekt.";
          }
        })
        .catch((error) => {
          console.error("Väderdata kunde inte hämtas", error);
          document.getElementById("weather-info").innerHTML =
            "Kunde inte hämta väderdata.";
        });
    });
  } else {
    document.getElementById("weather-info").innerHTML =
      "Kunde inte hämta platsinfo";
  }
}

document.getElementById("note-area").addEventListener("input", saveNotes);

function saveNotes() {
  const noteText = document.getElementById("note-area").value;
  localStorage.setItem("userNotes", noteText);
}

function loadNotes() {
  const savedNotes = localStorage.getItem("userNotes");
  if (savedNotes) {
    document.getElementById("note-area").value = savedNotes;
  }
}

function changeBackground() {
  const url = `https://api.unsplash.com/photos/random?client_id=_-RgKHA0BlIHSBPChIRedfD70QAWLXEbe1pUBpTi9d4`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log("API-svar:", data);

      const imageUrl = data.urls ? data.urls.regular : null;
      console.log("Bild-URL:", imageUrl);

      if (imageUrl) {
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
      } else {
        console.log("Ingen bild-URL hittades. Använder fallback.");
        document.body.style.backgroundImage =
          "url('https://images.unsplash.com/photo-1606330482575-3c347e846b77')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
      }
    })
    .catch((error) => {
      console.error("Fel vid hämtning av bild:", error);
      document.body.style.backgroundImage =
        "url('https://images.unsplash.com/photo-1606330482575-3c347e846b77')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    });
}

function getStockPrice(symbol, elementId, stockName) {
  const apiKey = "EGLZQZWCZCQC59RH";
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const timeSeries = data["Time Series (5min)"];
      const latestTime = Object.keys(timeSeries)[0];
      const latestPrice = timeSeries[latestTime]["4. close"];

      displayStockPrice(latestPrice, elementId, stockName);
    })
    .catch((error) => {
      console.error("Fel vid hämtning av aktiekurs:", error);
      document.getElementById(
        elementId
      ).textContent = `${stockName}: Kunde inte hämta aktiekurs.`;
    });
}

function displayStockPrice(price, elementId, stockName) {
  const priceElement = document.getElementById(elementId);
  const priceFloat = parseFloat(price);

  let displayText = `${stockName}: `;

  if (priceFloat > 0) {
    priceElement.classList.add("price-up");
    priceElement.classList.remove("price-down");
    displayText += `${priceFloat.toFixed(2)} SEK`;
  } else if (priceFloat < 0) {
    priceElement.classList.add("price-down");
    priceElement.classList.remove("price-up");
    displayText += `${priceFloat.toFixed(2)} SEK`;
  }

  priceElement.textContent = displayText;
}

getStockPrice("AAPL", "stock-info-1", "Apple");
getStockPrice("GOOGL", "stock-info-2", "Google");
