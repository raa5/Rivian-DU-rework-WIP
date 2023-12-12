var resultHistory = loadHistory(); // Load history from localStorage on page load
var chart;
var latestCumulativeResults = loadLatestCumulativeResults(); // Load latest cumulative results from localStorage on page load

function loadLatestCumulativeResults() {
  var savedCumulativeResults = localStorage.getItem("latestCumulativeResults");

  if (savedCumulativeResults) {
    return JSON.parse(savedCumulativeResults);
  } else {
    return {};
  }
}

function calculateResult() {
  var selectedDate = document.getElementById("datePicker").value;
  var duaValue = parseInt(document.getElementById("duaInput").value) || 0;
  var eolValue = parseInt(document.getElementById("eolInput").value) || 0;
  var reworkedValue =
    parseInt(document.getElementById("reworkedInput").value) || 0;
  var collegeWarehouseValue =
    parseInt(document.getElementById("collegeWarehouseInput").value) || 0;

  var dailyResult = duaValue + eolValue + collegeWarehouseValue - reworkedValue;

  // Load the latest cumulative results from local storage
  latestCumulativeResults = loadLatestCumulativeResults();

  // Add the latest cumulative result on the previous date to the daily result
  var previousDate = new Date(selectedDate);
  previousDate.setDate(previousDate.getDate() - 1);
  var previousDateKey = previousDate.toISOString().split("T")[0];
  var previousDateCumulativeResult =
    latestCumulativeResults[previousDateKey] || 0;

  var cumulativeResult = dailyResult + previousDateCumulativeResult;

  console.log(
    `previous day cum result: ${previousDateCumulativeResult}, daily result ${dailyResult}, cumulative result ${cumulativeResult}`
  );

  // Update the result input field with the daily result
  document.getElementById("result").value = dailyResult;
  document.getElementById("cumulativeResult").value = cumulativeResult;

  // Store results in history and update latest cumulative results
  storeResultInHistory(selectedDate, dailyResult, cumulativeResult);
  updateLatestCumulativeResults(selectedDate, cumulativeResult);

  // Display and update the chart
  displayChart();
}

function storeResultInHistory(date, dailyResult, cumulativeResult) {
  var existingRecordIndex = resultHistory.findIndex(
    (entry) => entry.date === date
  );

  if (existingRecordIndex !== -1) {
    // Update the existing record with the new results
    resultHistory[existingRecordIndex].dailyResult = dailyResult;
    resultHistory[existingRecordIndex].cumulativeResult = cumulativeResult;
  } else {
    // Add a new record
    resultHistory.push({
      date: date,
      dailyResult: dailyResult,
      cumulativeResult: cumulativeResult,
    });
  }

  // Display the latest cumulative record in the history container
  displayLatestCumulativeRecord();
}

function updateLatestCumulativeResults(date, cumulativeResult) {
  // Update the latest cumulative result for the given date
  latestCumulativeResults[date] = cumulativeResult;

  // Save the latest cumulative results to localStorage
  localStorage.setItem(
    "latestCumulativeResults",
    JSON.stringify(latestCumulativeResults)
  );
}

function displayLatestCumulativeRecord() {
  var historyContainer = document.getElementById("historyContainer");
  historyContainer.innerHTML = "";

  // Sort resultHistory by date in descending order
  resultHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  resultHistory.forEach((entry) => {
    var container = document.createElement("div");
    container.className = "historyItem";
    container.innerText = `${entry.date}: Daily Result: ${entry.dailyResult}, Cumulative Result: ${entry.cumulativeResult}`;
    container.addEventListener("click", function () {
      showDetails(entry.date);
    });
    historyContainer.appendChild(container);
  });

  // Save history to localStorage
  saveHistory(resultHistory);
}

function displayChart() {
  var dates = resultHistory.map((entry) => entry.date);
  var cumulativeResults = resultHistory.map((entry) => entry.cumulativeResult);

  var data = [
    {
      x: dates,
      y: cumulativeResults,
      type: "scatter",
      mode: "lines+markers",
    },
  ];

  var layout = {
    title: "Cumulative Rework Buffer Over Time",
    xaxis: {
      rangeslider: {
        autorange: true,
      },
    },
  };

  if (!chart) {
    chart = Plotly.newPlot("chartContainer", data, layout);
  } else {
    Plotly.react("chartContainer", data, layout);
  }
}

function showDetails(date) {
  alert(`Details for ${date}`);
}

function loadHistory() {
  var savedHistory = localStorage.getItem("resultHistory");

  if (savedHistory) {
    return JSON.parse(savedHistory);
  } else {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem("resultHistory", JSON.stringify(history));
}

function clearHistory() {
  resultHistory = [];
  var historyContainer = document.getElementById("historyContainer");
  historyContainer.innerHTML = "";
  document.getElementById("result").value = "";
  document.getElementById("cumulativeResult").value = "";
  displayChart();
  saveHistory(resultHistory);
}

function exportResults() {
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(resultHistory);
  XLSX.utils.book_append_sheet(wb, ws, "Result History");
  XLSX.writeFile(wb, "result_history.xlsx");
}

function exportChart() {
  var chartContainer = document.getElementById("chartContainer");

  html2canvas(chartContainer).then(function (canvas) {
    var dataURL = canvas.toDataURL("image/png");

    var gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript:
        "https://cdn.rawgit.com/antimatter15/jsgif/master/dist/gif.worker.js",
    });

    gif.addFrame(canvas, {
      delay: 200,
    });
    gif.render();

    gif.on("finished", function (blob) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "chart.gif";
      a.click();
    });
  });
}

// Call the displayChart function on page load
displayChart();
// Display the latest cumulative record in the history container on page load
displayLatestCumulativeRecord();

// var resultHistory = loadHistory(); // Load history from localStorage on page load
// var chart;
// var latestCumulativeResults = {}; // Store the latest cumulative results datewise

// // Load latest chart and history on page load
// displayChart();
// displayLatestCumulativeRecord();

// function calculateResult() {
//   var selectedDate = document.getElementById("datePicker").value;
//   var duaValue = parseInt(document.getElementById("duaInput").value) || 0;
//   var eolValue = parseInt(document.getElementById("eolInput").value) || 0;
//   var reworkedValue =
//     parseInt(document.getElementById("reworkedInput").value) || 0;
//   var collegeWarehouseValue =
//     parseInt(document.getElementById("collegeWarehouseInput").value) || 0;

//   var dailyResult = duaValue + eolValue + collegeWarehouseValue - reworkedValue;

//   // Add the latest cumulative result on the previous date to the daily result
//   var previousDate = new Date(selectedDate);
//   previousDate.setDate(previousDate.getDate() - 1);
//   var previousDateKey = previousDate.toISOString().split("T")[0];
//   var previousDateCumulativeResult =
//     latestCumulativeResults[previousDateKey] || 0;

//   var cumulativeResult = dailyResult + previousDateCumulativeResult;

//   // Update the result input field with the daily result
//   document.getElementById("result").value = dailyResult;
//   document.getElementById("cumulativeResult").value = cumulativeResult;

//   // Store results in history and update latest cumulative results
//   storeResultInHistory(selectedDate, dailyResult, cumulativeResult);
//   updateLatestCumulativeResults(selectedDate, cumulativeResult);

//   // Display and update the chart
//   displayChart();
// }

// function storeResultInHistory(date, dailyResult, cumulativeResult) {
//   var existingRecordIndex = resultHistory.findIndex(
//     (entry) => entry.date === date
//   );

//   if (existingRecordIndex !== -1) {
//     // Update the existing record with the new results
//     resultHistory[existingRecordIndex].dailyResult = dailyResult;
//     resultHistory[existingRecordIndex].cumulativeResult = cumulativeResult;
//   } else {
//     // Add a new record
//     resultHistory.push({
//       date: date,
//       dailyResult: dailyResult,
//       cumulativeResult: cumulativeResult,
//     });
//   }

//   // Display the latest cumulative record in the history container
//   displayLatestCumulativeRecord();
// }

// function updateLatestCumulativeResults(date, cumulativeResult) {
//   latestCumulativeResults[date] = cumulativeResult;

//   // Update the cumulative results for consecutive dates
//   var currentDates = Object.keys(latestCumulativeResults);
//   var currentDateIndex = currentDates.indexOf(date);

//   if (currentDateIndex > 0) {
//     for (var i = currentDateIndex - 1; i >= 0; i--) {
//       var prevDate = currentDates[i];
//       var prevDateCumulativeResult = latestCumulativeResults[prevDate] || 0;
//       latestCumulativeResults[prevDate] =
//         prevDateCumulativeResult + dailyResult;
//     }
//   }
// }

// function displayLatestCumulativeRecord() {
//   var historyContainer = document.getElementById("historyContainer");
//   historyContainer.innerHTML = "";

//   // Sort resultHistory by date in descending order
//   var sortedHistory = resultHistory.slice().sort((a, b) => {
//     return new Date(b.date) - new Date(a.date);
//   });

//   sortedHistory.forEach((entry) => {
//     var container = document.createElement("div");
//     container.className = "historyItem";
//     container.innerText = `${entry.date}: Daily Result: ${entry.dailyResult}, Cumulative Result: ${entry.cumulativeResult}`;
//     container.addEventListener("click", function () {
//       showDetails(entry.date);
//     });
//     historyContainer.appendChild(container);
//   });

//   // Save history to localStorage
//   saveHistory(resultHistory);
// }

// function displayChart() {
//   var dates = resultHistory.map((entry) => entry.date);
//   var cumulativeResults = resultHistory.map((entry) => entry.cumulativeResult);

//   var data = [
//     {
//       x: dates,
//       y: cumulativeResults,
//       type: "scatter",
//       mode: "lines+markers",
//     },
//   ];

//   var layout = {
//     title: "Cumulative Result Over Time",
//     xaxis: {
//       rangeslider: {
//         autorange: true,
//       },
//     },
//   };

//   if (!chart) {
//     chart = Plotly.newPlot("chartContainer", data, layout);
//   } else {
//     Plotly.react("chartContainer", data, layout);
//   }
// }

// function showDetails(date) {
//   alert(`Details for ${date}`);
// }

// function loadHistory() {
//   var savedHistory = localStorage.getItem("resultHistory");

//   if (savedHistory) {
//     resultHistory = JSON.parse(savedHistory);
//   }

//   return resultHistory;
// }

// function saveHistory(history) {
//   localStorage.setItem("resultHistory", JSON.stringify(history));
// }

// function clearHistory() {
//   resultHistory = [];
//   var historyContainer = document.getElementById("historyContainer");
//   historyContainer.innerHTML = "";
//   document.getElementById("result").value = "";
//   document.getElementById("cumulativeResult").value = "";
//   displayChart();
//   displayLatestCumulativeRecord();
//   saveHistory(resultHistory);
// }

// function exportResults() {
//   var wb = XLSX.utils.book_new();
//   var ws = XLSX.utils.json_to_sheet(resultHistory);
//   XLSX.utils.book_append_sheet(wb, ws, "Result History");
//   XLSX.writeFile(wb, "result_history.xlsx");
// }

// function exportChart() {
//   var chartContainer = document.getElementById("chartContainer");

//   html2canvas(chartContainer).then(function (canvas) {
//     var dataURL = canvas.toDataURL("image/png");

//     var gif = new GIF({
//       workers: 2,
//       quality: 10,
//       workerScript:
//         "https://cdn.rawgit.com/antimatter15/jsgif/master/dist/gif.worker.js",
//     });

//     gif.addFrame(canvas, {
//       delay: 200,
//     });
//     gif.render();

//     gif.on("finished", function (blob) {
//       var a = document.createElement("a");
//       a.href = URL.createObjectURL(blob);
//       a.download = "chart.gif";
//       a.click();
//     });
//   });
// }

// // var resultHistory = loadHistory(); // Load history from localStorage on page load
// // var chart;
// // var latestCumulativeResults = {}; // Store the latest cumulative results datewise

// // function calculateResult() {
// //   var selectedDate = document.getElementById("datePicker").value;
// //   var duaValue = parseInt(document.getElementById("duaInput").value) || 0;
// //   var eolValue = parseInt(document.getElementById("eolInput").value) || 0;
// //   var reworkedValue =
// //     parseInt(document.getElementById("reworkedInput").value) || 0;
// //   var collegeWarehouseValue =
// //     parseInt(document.getElementById("collegeWarehouseInput").value) || 0;

// //   var dailyResult = duaValue + eolValue + collegeWarehouseValue - reworkedValue;

// //   // Add the latest cumulative result on the previous date to the daily result
// //   var previousDate = new Date(selectedDate);
// //   previousDate.setDate(previousDate.getDate() - 1);
// //   var previousDateKey = previousDate.toISOString().split("T")[0];
// //   var previousDateCumulativeResult =
// //     latestCumulativeResults[previousDateKey] || 0;

// //   var cumulativeResult = dailyResult + previousDateCumulativeResult;

// //   console.log(
// //     `previous day cum result: ${previousDateCumulativeResult}, daily result ${dailyResult}, cumulative result ${cumulativeResult}`
// //   );

// //   // Update the result input field with the daily result
// //   document.getElementById("result").value = dailyResult;
// //   document.getElementById("cumulativeResult").value = cumulativeResult;

// //   // Store results in history and update latest cumulative results
// //   storeResultInHistory(selectedDate, dailyResult, cumulativeResult);
// //   updateLatestCumulativeResults(selectedDate, cumulativeResult);

// //   // Display and update the chart
// //   displayChart();
// // }

// // function storeResultInHistory(date, dailyResult, cumulativeResult) {
// //   var existingRecordIndex = resultHistory.findIndex(
// //     (entry) => entry.date === date
// //   );

// //   if (existingRecordIndex !== -1) {
// //     // Update the existing record with the new results
// //     resultHistory[existingRecordIndex].dailyResult = dailyResult;
// //     resultHistory[existingRecordIndex].cumulativeResult = cumulativeResult;
// //   } else {
// //     // Add a new record
// //     resultHistory.push({
// //       date: date,
// //       dailyResult: dailyResult,
// //       cumulativeResult: cumulativeResult,
// //     });
// //   }

// //   // Display the latest cumulative record in the history container
// //   displayLatestCumulativeRecord();
// // }

// // function updateLatestCumulativeResults(date, cumulativeResult) {
// //   // Update the latest cumulative result for the given date
// //   latestCumulativeResults[date] = cumulativeResult;

// //   // Update the cumulative results for consecutive dates
// //   var currentDates = Object.keys(latestCumulativeResults);
// //   var currentDateIndex = currentDates.indexOf(date);

// //   if (currentDateIndex > 0) {
// //     for (var i = currentDateIndex - 1; i >= 0; i--) {
// //       var prevDate = currentDates[i];
// //       var prevDateCumulativeResult = latestCumulativeResults[prevDate] || 0;
// //       latestCumulativeResults[prevDate] =
// //         prevDateCumulativeResult + dailyResult;
// //     }
// //   }
// // }

// // function displayLatestCumulativeRecord() {
// //   var historyContainer = document.getElementById("historyContainer");
// //   historyContainer.innerHTML = "";

// //   resultHistory.forEach((entry) => {
// //     var container = document.createElement("div");
// //     container.className = "historyItem";
// //     container.innerText = `${entry.date}: Daily Result: ${entry.dailyResult}, Cumulative Result: ${entry.cumulativeResult}`;
// //     container.addEventListener("click", function () {
// //       showDetails(entry.date);
// //     });
// //     historyContainer.appendChild(container);
// //   });

// //   // Save history to localStorage
// //   saveHistory(resultHistory);
// // }

// // function displayChart() {
// //   var dates = resultHistory.map((entry) => entry.date);
// //   var cumulativeResults = resultHistory.map((entry) => entry.cumulativeResult);

// //   var data = [
// //     {
// //       x: dates,
// //       y: cumulativeResults,
// //       type: "scatter",
// //       mode: "lines+markers",
// //     },
// //   ];

// //   var layout = {
// //     title: "Cumulative Result Over Time",
// //     xaxis: {
// //       rangeslider: {
// //         autorange: true,
// //       },
// //     },
// //   };

// //   if (!chart) {
// //     chart = Plotly.newPlot("chartContainer", data, layout);
// //   } else {
// //     Plotly.react("chartContainer", data, layout);
// //   }
// // }

// // function showDetails(date) {
// //   alert(`Details for ${date}`);
// // }

// // function loadHistory() {
// //   var savedHistory = localStorage.getItem("resultHistory");

// //   if (savedHistory) {
// //     return JSON.parse(savedHistory);
// //   } else {
// //     return [];
// //   }
// // }

// // function saveHistory(history) {
// //   localStorage.setItem("resultHistory", JSON.stringify(history));
// // }

// // function clearHistory() {
// //   resultHistory = [];
// //   var historyContainer = document.getElementById("historyContainer");
// //   historyContainer.innerHTML = "";
// //   document.getElementById("result").value = "";
// //   document.getElementById("cumulativeResult").value = "";
// //   displayChart();
// //   saveHistory(resultHistory);
// // }

// // function exportResults() {
// //   var wb = XLSX.utils.book_new();
// //   var ws = XLSX.utils.json_to_sheet(resultHistory);
// //   XLSX.utils.book_append_sheet(wb, ws, "Result History");
// //   XLSX.writeFile(wb, "result_history.xlsx");
// // }

// // function exportChart() {
// //   var chartContainer = document.getElementById("chartContainer");

// //   html2canvas(chartContainer).then(function (canvas) {
// //     var dataURL = canvas.toDataURL("image/png");

// //     var gif = new GIF({
// //       workers: 2,
// //       quality: 10,
// //       workerScript:
// //         "https://cdn.rawgit.com/antimatter15/jsgif/master/dist/gif.worker.js",
// //     });

// //     gif.addFrame(canvas, {
// //       delay: 200,
// //     });
// //     gif.render();

// //     gif.on("finished", function (blob) {
// //       var a = document.createElement("a");
// //       a.href = URL.createObjectURL(blob);
// //       a.download = "chart.gif";
// //       a.click();
// //     });
// //   });
// // }
