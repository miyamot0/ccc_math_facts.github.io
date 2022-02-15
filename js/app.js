//(function() {

function login() {
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(userEmail, userPass)
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      window.alert("Error : " + errorMessage);
    });
}

function logout() {
  firebase.auth().signOut();
}

function hideAuthContent() {
  document.getElementById("login_block").style.display = "none";

  var myClasses = document.querySelectorAll(".authElements"),
    i = 0,
    l = myClasses.length;

  for (i; i < l; i++) {
    myClasses[i].style.display = "block";
  }
}

function showAuthContent() {
  document.getElementById("login_block").style.display = "block";

  var myClasses = document.querySelectorAll(".authElements"),
    i = 0,
    l = myClasses.length;

  for (i; i < l; i++) {
    myClasses[i].style.display = "none";
  }
}

function getStudentCollectionPath(id) {
  return "mainCollection/" + id + "/students";
}

function buildHeader(size) {
  return size == 1 ? "1 participant" : size + " participants";
}

function snapshotUpdateCall(querySnapshot) {
  if (!querySnapshot.empty) {
    console.log(querySnapshot.size);

    document.getElementById("nParticipantSpan").innerHTML = buildHeader(
      querySnapshot.size
    );

    document.getElementById("participantDiv").innerHTML = "";
    var tableBody = document.getElementById("tableBody2");
    tableBody.innerHTML = "";

    querySnapshot.forEach(function (doc) {
      const data = doc.data();

      console.log(data);

      //
      var newRow = document.createElement("tr");

      ////
      var cell = document.createElement("td");
      var cellText = document.createTextNode(data.name);
      cell.appendChild(cellText);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.target);
      cell.appendChild(cellText);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.setSize);
      cell.appendChild(cellText);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.set);
      cell.appendChild(cellText);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(doc.id);
      cell.appendChild(cellText);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute(
        "href",
        'javascript:updateParticipant("' +
          doc.id +
          '","' +
          data.participantTag +
          '");'
      );
      aTag.setAttribute("class", "leading btn btn-raised");
      aTag.innerHTML = "Load Progress";

      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      //
      aTag = document.createElement("a");
      aTag.setAttribute("data-toggle", "modal");
      aTag.setAttribute("data-target", "#editParticipantModal");

      aTag.setAttribute("class", "leading btn btn-raised open-sessionDialog");

      aTag.setAttribute("data-id", doc.id);
      aTag.setAttribute("data-participantTag", data.name);
      aTag.setAttribute("data-descriptionTag", data.target);
      aTag.setAttribute("data-difficultyLevel", data.setSize);
      aTag.setAttribute("data-displayTime", data.set);
      aTag.setAttribute("data-trialNumbers", 0);

      aTag.innerHTML = "Edit Session";

      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);
    });
  }
}

function addNewParticipant() {
  var pName = document.getElementById("addParticipantTag").value;
  var pTarget = document.getElementById("addParticipantTarget").value;
  var pSetSize = document.getElementById("addParticipantSetSize").value;
  var pSetNum = document.getElementById("addParticipantSetNumber").value;

  if (!$.isNumeric(pSetSize)) {
    alert("Difficulty must be a number.");
    return;
  }

  if (!$.isNumeric(pSetNum)) {
    alert("Duration (seconds) must be a number.");
    return;
  }

  pSetSize = parseInt(pSetSize);
  pSetNum = parseInt(pSetNum);

  const user = firebase.auth().currentUser;
  const path = getStudentCollectionPath(user["uid"]);

  db.collection(path)
    .add({
      name: pName,
      target: pTarget,
      set: pSetNum.toString(),
      setSize: pSetSize.toString(),
    })
    .then(function (docRef) {
      $("#addParticipantModal").modal("hide");

      document.getElementById("addParticipantTag").value = "";
      document.getElementById("addParticipantTarget").value = "";
      document.getElementById("addParticipantSetSize").value = "";
      document.getElementById("addParticipantSetNumber").value = "";
    })
    .catch(function (err) {
      alert(err);
    });
}

function updateParticipant(tag, name) {
  /*
    const user = firebase.auth().currentUser;
    const currPath = buildDocumentPath(user["uid"], tag);
  
    if (oldListenerPath != null || oldListenerPath == currPath) {
      var unsubscribe = firestore
        .collection(oldListenerPath)
        .onSnapshot(function () {});
      unsubscribe();
    }
  
    oldListenerPath = currPath;
  
    var docRef = firestore.collection(currPath);
  
    document.getElementById("tagParticipantSpan").innerHTML = name;
  
    docRef.onSnapshot(function (querySnapshot) {
      var tableBody = document.getElementById("tableBody");
      tableBody.innerHTML = "";
      var prePlotter = [];
  
      if (!querySnapshot.empty) {
        querySnapshot.forEach(function (doc) {
          const mData = doc.data();
          prePlotter.push(mData);
        });
      }
  
      updateTable(prePlotter);
    });
    */
}

/*
function download() {
  var csv = "";
  data.forEach(function (row) {
    csv += row.join(",");
    csv += "\n";
  });

  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = "download.csv";
  hiddenElement.click();

  console.log(csv);
}



function buildDocumentPath(id, tag) {
  return "storage/" + id + "/participants/" + tag + "/sessions";
}

function buildDocumentPath1s1c(id, tag) {
  return "storage/" + id + "/participants/" + tag + "/practice1stim";
}

function buildDocumentPath1s2c(id, tag) {
  return "storage/" + id + "/participants/" + tag + "/practice2stim";
}

function updateFigure() {
  var mLabels = [];

  var mPlotData = [];
  var mPlotDifficulty = [];

  var table = document.getElementById("tableBody");
  for (var i = 0, row; (row = table.rows[i]); i++) {
    mPlotData.push({
      x: i,
      y: parseFloat(row.cells[7].innerText).toFixed(2),
    });

    mPlotDifficulty.push({
      x: i,
      y: parseFloat(row.cells[3].innerText).toFixed(2),
    });

    mLabels.push("" + i);
  }

  var config = {
    type: "line",
    data: {
      labels: mLabels,
      datasets: [
        {
          label: "Accuracy",
          data: mPlotData,
          borderColor: window.chartColors.green,
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        },
        {
          label: "Difficulty",
          data: mPlotDifficulty,
          borderColor: window.chartColors.red,
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Participant Id: ",
      },
      tooltips: {
        mode: "index",
      },
      scales: {
        xAxes: [
          {
            //type: 'time',
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Session",
            },
            ticks: {
              major: {
                fontStyle: "bold",
                fontColor: "#FF0000",
              },
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Accuracy",
            },
            ticks: {
              suggestedMin: 0,
            },
          },
        ],
      },
    },
  };

  var ctx = document.getElementById("canvas").getContext("2d");

  window.myLine = new Chart(ctx, config);
  window.myLine.update();
}

function updateFigure1s1c() {
  var mLabels = [];
  var mPlotData = [];

  var table = document.getElementById("tableBody");

  for (var i = 0, row; (row = table.rows[i]); i++) {
    mPlotData.push({
      x: i,
      y: parseFloat(row.cells[7].innerText).toFixed(2),
    });

    mLabels.push("" + i);
  }

  var config = {
    type: "line",
    data: {
      labels: mLabels,
      datasets: [
        {
          label: "Accuracy",
          data: mPlotData,
          borderColor: window.chartColors.green,
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Participant Training (1s1c)",
      },
      tooltips: {
        mode: "index",
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Session",
            },
            ticks: {
              major: {
                fontStyle: "bold",
                fontColor: "#FF0000",
              },
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Accuracy",
            },
            ticks: {
              suggestedMin: 0,
            },
          },
        ],
      },
    },
  };

  var ctx = document.getElementById("canvas").getContext("2d");

  window.myLine = new Chart(ctx, config);
  window.myLine.update();
}

function updateFigure1s2c() {
  var mLabels = [];
  var mPlotData = [];

  var table = document.getElementById("tableBody");

  for (var i = 0, row; (row = table.rows[i]); i++) {
    mPlotData.push({
      x: i,
      y: parseFloat(row.cells[7].innerText).toFixed(2),
    });

    mLabels.push("" + i);
  }

  var config = {
    type: "line",
    data: {
      labels: mLabels,
      datasets: [
        {
          label: "Accuracy",
          data: mPlotData,
          borderColor: window.chartColors.green,
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Participant Training (1s2c)",
      },
      tooltips: {
        mode: "index",
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Session",
            },
            ticks: {
              major: {
                fontStyle: "bold",
                fontColor: "#FF0000",
              },
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Accuracy",
            },
            ticks: {
              suggestedMin: 0,
            },
          },
        ],
      },
    },
  };

  var ctx = document.getElementById("canvas").getContext("2d");

  window.myLine = new Chart(ctx, config);
  window.myLine.update();
}

function updateTable(prePlotter) {
  var tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  var rowId = 0;

  data = [];
  data.push([
    "Date",
    "Difficulty",
    "Trial Count",
    "Accuracy",
    "s1c1",
    "s1c2",
    "s2c1",
    "s2c2",
    "corLeft",
    "corRight",
    "wrngLeft",
    "wrngRight",
    "skipped",
    "correct",
    "incorrect",
    "s1corL",
    "s1corR",
    "s1errL",
    "s1errR",
    "s2corL",
    "s2corR",
    "s2errL",
    "s2errR",
    "latencyCorrect",
    "latencyIncorrect",
  ]);

  prePlotter.forEach(function (row) {
    var newRow = document.createElement("tr");

    // Session Num
    var cell = document.createElement("td");
    var cellText = document.createTextNode(rowId);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Session Date
    cell = document.createElement("td");
    cellText = document.createTextNode(row.sessionDate);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Display time
    cell = document.createElement("td");
    cellText = document.createTextNode(row.displayTime);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // difficultyLevel
    cell = document.createElement("td");
    cellText = document.createTextNode(row.difficultyLevel);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // trialCount
    cell = document.createElement("td");
    cellText = document.createTextNode(row.trialCount);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // correctAnswers
    cell = document.createElement("td");
    cellText = document.createTextNode(row.correctAnswers);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // correctAnswers
    cell = document.createElement("td");
    cellText = document.createTextNode(row.wrongAnswers);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    // percentage correct
    cell = document.createElement("td");
    cellText = document.createTextNode(
      (
        (row.correctAnswers / (row.wrongAnswers + row.correctAnswers)) *
        100
      ).toFixed(2)
    );
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    var logD =
      (Math.log10(
        (row.s1c1 + row.s1c2 + 0.25) / (row.s1errL + row.s1errR + 0.25)
      ) *
        Math.log10(
          (row.s2c1 + row.s2c2 + 0.25) / (row.s2errL + row.s2errR + 0.25)
        )) /
      2.0;

    // log d
    cell = document.createElement("td");
    cellText = document.createTextNode(logD.toFixed(2));
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    var logB =
      0.5 *
      Math.log10(
        ((row.corLeft + constant) / (row.corRght + constant)) *
          ((row.errLeft + constant) / (row.errRght + constant))
      );

    // log b
    cell = document.createElement("td");
    cellText = document.createTextNode(logB.toFixed(2));
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    data.push([
      row.sessionDate,
      row.difficultyLevel,
      row.trialCount,
      (row.correctAnswers / (row.wrongAnswers + row.correctAnswers)) * 100,
      row.s1c1,
      row.s1c2,
      row.s2c1,
      row.s2c2,
      row.corLeft,
      row.corRght,
      row.errLeft,
      row.errRght,
      row.skippedTrials,
      row.correctAnswers,
      row.wrongAnswers,
      row.s1corL,
      row.s1corR,
      row.s1errL,
      row.s1errR,
      row.s2corL,
      row.s2corR,
      row.s2errL,
      row.s2errR,
      row.latencyCorrect,
      row.latencyIncorrect,
    ]);

    rowId++;
  });

  updateFigure();
}

function updateTable1s1c(prePlotter) {
  var tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  var rowId = 0;

  data = [];
  data.push([
    "Date",
    "Difficulty",
    "Trial Count",
    "Accuracy",
    "s1c1",
    "s1c2",
    "s2c1",
    "s2c2",
    "corLeft",
    "corRight",
    "wrngLeft",
    "wrngRight",
    "skipped",
    "correct",
    "incorrect",
    "s1corL",
    "s1corR",
    "s1errL",
    "s1errR",
    "s2corL",
    "s2corR",
    "s2errL",
    "s2errR",
    "latencyCorrect",
    "latencyIncorrect",
  ]);

  prePlotter.forEach(function (row) {
    var newRow = document.createElement("tr");

    // Session Num
    var cell = document.createElement("td");
    var cellText = document.createTextNode(rowId);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Session Date
    var cell = document.createElement("td");
    var cellText = document.createTextNode(row.sessionDate);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Display time
    cell = document.createElement("td");
    cellText = document.createTextNode(0);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // difficultyLevel
    cell = document.createElement("td");
    cellText = document.createTextNode("---");
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // trialCount
    cell = document.createElement("td");
    cellText = document.createTextNode(row.trialCount);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // correctAnswers
    cell = document.createElement("td");
    cellText = document.createTextNode(row.correctAnswers);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    //
    cell = document.createElement("td");
    cellText = document.createTextNode(row.wrongAnswers);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    // percentage correct
    cell = document.createElement("td");
    cellText = document.createTextNode(
      (
        (row.correctAnswers / (row.wrongAnswers + row.correctAnswers)) *
        100
      ).toFixed(2)
    );
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    var gridSize = row.trialCount / 2;

    var logD =
      0.5 *
      Math.log10(
        ((row.s1c1 + constant) / (gridSize - row.s1c1 + constant)) *
          ((row.s2c2 + constant) / (gridSize - row.s2c2 + constant))
      );

    // log d
    cell = document.createElement("td");
    cellText = document.createTextNode("---");
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    var logB =
      0.5 *
      Math.log10(
        ((row.corLeft + constant) / (row.corRght + constant)) *
          ((row.errLeft + constant) / (row.errRght + constant))
      );

    // log b
    cell = document.createElement("td");
    cellText = document.createTextNode("---");
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    data.push([
      row.sessionDate,
      row.difficultyLevel,
      row.trialCount,
      (row.correctAnswers / (row.wrongAnswers + row.correctAnswers)) * 100,
      row.s1c1,
      row.s1c2,
      row.s2c1,
      row.s2c2,
      row.corLeft,
      row.corRght,
      row.errLeft,
      row.errRght,
      row.skippedTrials,
      row.correctAnswers,
      row.wrongAnswers,
      row.s1corL,
      row.s1corR,
      row.s1errL,
      row.s1errR,
      row.s2corL,
      row.s2corR,
      row.s2errL,
      row.s2errR,
      row.latencyCorrect,
      row.latencyIncorrect,
    ]);

    rowId++;
  });

  updateFigure1s1c();
}

function updateTable1s2c(prePlotter) {
  var tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  var rowId = 0;

  data = [];
  data.push([
    "Date",
    "Difficulty",
    "Trial Count",
    "Accuracy",
    "s1c1",
    "s1c2",
    "s2c1",
    "s2c2",
    "corLeft",
    "corRight",
    "wrngLeft",
    "wrngRight",
    "skipped",
    "correct",
    "incorrect",
    "s1corL",
    "s1corR",
    "s1errL",
    "s1errR",
    "s2corL",
    "s2corR",
    "s2errL",
    "s2errR",
    "latencyCorrect",
    "latencyIncorrect",
  ]);

  prePlotter.forEach(function (row) {
    var newRow = document.createElement("tr");

    // Session Num
    var cell = document.createElement("td");
    var cellText = document.createTextNode(rowId);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Session Date
    var cell = document.createElement("td");
    var cellText = document.createTextNode(row.sessionDate);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Display time
    cell = document.createElement("td");
    cellText = document.createTextNode(0);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // difficultyLevel
    cell = document.createElement("td");
    cellText = document.createTextNode("---");
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // trialCount
    cell = document.createElement("td");
    cellText = document.createTextNode(row.trialCount);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // correctAnswers
    cell = document.createElement("td");
    cellText = document.createTextNode(row.correctAnswers);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    //
    cell = document.createElement("td");
    cellText = document.createTextNode(row.wrongAnswers);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    // percentage correct
    cell = document.createElement("td");
    cellText = document.createTextNode(
      (
        (row.correctAnswers / (row.wrongAnswers + row.correctAnswers)) *
        100
      ).toFixed(2)
    );
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    var gridSize = row.trialCount / 2;

    var logD =
      0.5 *
      Math.log10(
        ((row.s1c1 + constant) / (gridSize - row.s1c1 + constant)) *
          ((row.s2c2 + constant) / (gridSize - row.s2c2 + constant))
      );

    // log d
    cell = document.createElement("td");
    cellText = document.createTextNode("---");
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    var logB =
      0.5 *
      Math.log10(
        ((row.corLeft + constant) / (row.corRght + constant)) *
          ((row.errLeft + constant) / (row.errRght + constant))
      );

    // log b
    cell = document.createElement("td");
    cellText = document.createTextNode("---");
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    data.push([
      row.sessionDate,
      row.difficultyLevel,
      row.trialCount,
      (row.correctAnswers / (row.wrongAnswers + row.correctAnswers)) * 100,
      row.s1c1,
      row.s1c2,
      row.s2c1,
      row.s2c2,
      row.corLeft,
      row.corRght,
      row.errLeft,
      row.errRght,
      row.skippedTrials,
      row.correctAnswers,
      row.wrongAnswers,
      row.s1corL,
      row.s1corR,
      row.s1errL,
      row.s1errR,
      row.s2corL,
      row.s2corR,
      row.s2errL,
      row.s2errR,
      row.latencyCorrect,
      row.latencyIncorrect,
    ]);

    rowId++;
  });

  updateFigure1s2c();
}



function updateParticipant1s1c(tag, name) {
  const user = firebase.auth().currentUser;

  const currPath = buildDocumentPath1s1c(user["uid"], tag);

  if (oldListenerPath != null || oldListenerPath == currPath) {
    var unsubscribe = firestore
      .collection(oldListenerPath)
      .onSnapshot(function () {});
    unsubscribe();
  }

  oldListenerPath = currPath;

  var docRef = firestore.collection(currPath);

  document.getElementById("tagParticipantSpan").innerHTML = name;

  docRef.onSnapshot(function (querySnapshot) {
    var tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";
    var prePlotter = [];

    if (!querySnapshot.empty) {
      querySnapshot.forEach(function (doc) {
        const mData = doc.data();
        prePlotter.push(mData);
      });
    }

    updateTable1s1c(prePlotter);
  });
}

function updateParticipant1s2c(tag, name) {
  const user = firebase.auth().currentUser;

  const currPath = buildDocumentPath1s2c(user["uid"], tag);

  if (oldListenerPath != null || oldListenerPath == currPath) {
    var unsubscribe = firestore
      .collection(oldListenerPath)
      .onSnapshot(function () {});
    unsubscribe();
  }

  oldListenerPath = currPath;

  var docRef = firestore.collection(currPath);

  document.getElementById("tagParticipantSpan").innerHTML = name;

  docRef.onSnapshot(function (querySnapshot) {
    var tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";
    var prePlotter = [];

    if (!querySnapshot.empty) {
      querySnapshot.forEach(function (doc) {
        const mData = doc.data();
        prePlotter.push(mData);
      });
    }

    updateTable1s2c(prePlotter);
  });
}

function editParticipant() {
  console.log("editing");
}








*/

/*
var data = [];

// init db
const firebaseConfig = {
  apiKey: "AIzaSyDlyXTl-vh5cKXM8899hYk9de6Njuwsc3w",
  authDomain: "covcopcompmathfact.firebaseapp.com",
  projectId: "covcopcompmathfact",
  storageBucket: "covcopcompmathfact.appspot.com",
  messagingSenderId: "206486473497",
  appId: "1:206486473497:web:4b34e91ad8534338ca5388",
  measurementId: "G-7QE2GHRE1E",
};

firebase.initializeApp(firebaseConfig);

var firestore = firebase.firestore();

firestore.settings({
  timestampsInSnapshots: true,
});

var oldListenerPath = null;

var constant = 0.25;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    hideAuthContent();

    //const path = buildParticipantPath(user["uid"]);

    //var collRef = firestore.collection(path);

    collRef.onSnapshot(snapshotUpdateCall);
  } else {
    showAuthContent();
  }
});

*/

$(document).on("click", ".open-sessionDialog", function () {
  /*
  var pTag = $(this).data("participanttag");

  var recordId = $(this).data("id");
  var pDesc = $(this).data("descriptiontag");
  var pDiff = $(this).data("difficultylevel");
  var pTime = $(this).data("displaytime");
  var pSessions = $(this).data("trialnumbers");

  $(".modal-body #editParticipantTag").val(pTag);
  $(".modal-body #editParticipantDescription").val(pDesc);
  $(".modal-body #editParticipantDifficulty").val(pDiff);
  $(".modal-body #editParticipantDuration").val(pTime);
  $(".modal-body #editParticipantTrials").val(pSessions);

  $("#editParticipantSave").click(null);
  $("#editParticipantSave")
    .unbind()
    .click(function () {
      var pId = document.getElementById("editParticipantTag").value;
      var pDes = document.getElementById("editParticipantDescription").value;
      var pDiff = document.getElementById("editParticipantDifficulty").value;
      var pDur = document.getElementById("editParticipantDuration").value;
      var pTrls = document.getElementById("editParticipantTrials").value;

      if (!$.isNumeric(pDiff)) {
        alert("Difficulty must be a number.");
        return;
      }

      if (!$.isNumeric(pDur)) {
        alert("Duration (seconds) must be a number.");
        return;
      }

      if (!$.isNumeric(pTrls)) {
        alert("Trials (counts) must be a number.");
        return;
      }

      pDiff = parseInt(pDiff);
      pDur = parseInt(pDur);
      pTrls = parseInt(pTrls);

      const user = firebase.auth().currentUser;
      const path = buildParticipantPath(user["uid"]) + "/" + recordId;

      firestore
        .doc(path)
        .update({
          descriptionTag: pDes,
          difficultyLevel: pDiff,
          displayTime: pDur,
          participantTag: pId,
          trialNumbers: pTrls,
        })
        .then(function (docRef) {
          $("#editParticipantModal").modal("hide");

          document.getElementById("editParticipantTag").value = "";
          document.getElementById("editParticipantDescription").value = "";
          document.getElementById("editParticipantDifficulty").value = "";
          document.getElementById("editParticipantDuration").value = "";
          document.getElementById("editParticipantTrials").value = "";
        })
        .catch(function (err) {
          alert(err);
        });

      $("#editParticipantSave").click(null);
    });
    */
});
//})
