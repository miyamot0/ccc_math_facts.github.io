/**
 * Login function, entry point
 */
function login() {
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(userEmail, userPass)
    .catch(function (error) {
      window.alert("Error : " + error.message);
    });
}

/**
 * Logout function, exit point
 */
function logout() {
  if (teacherListenerPath != null) {
    var unsubscribe = db
      .collection(teacherListenerPath)
      .onSnapshot(function () {});
    unsubscribe();
  }

  document.getElementById("participantDiv").innerHTML = "";
  document.getElementById("selectHolder").innerHTML = "";
  document.getElementById("tableBody").innerHTML = "";
  document.getElementById("tableBody2").innerHTML = "";
  document.getElementById("nParticipantSpan").innerHTML = buildHeader("...");

  clearFigure();

  firebase.auth().signOut();
}

/**
 * Hide auth content if authorized
 */
function hideAuthContent() {
  document.getElementById("login_block").style.display = "none";

  var myClasses = document.querySelectorAll(".authElements"),
    l = myClasses.length;

  for (i = 0; i < l; i++) myClasses[i].style.display = "block";
}

/**
 * Show auth content if not authorized
 */
function showAuthContent() {
  document.getElementById("login_block").style.display = "block";

  var myClasses = document.querySelectorAll(".authElements"),
    l = myClasses.length;

  for (i = 0; i < l; i++) myClasses[i].style.display = "none";
}

/**
 *
 * Construct header for homepage
 *
 * @param {int} nParticipants number of participants
 * @returns {string} header inner html
 */
function buildHeader(nParticipants) {
  return nParticipants == 1 ? "1 participant" : nParticipants + " participants";
}

/**
 *
 * Listener call for when current teacher is changed or set
 *
 * @param {QuerySnapshot} qS
 */
function onTeacherUpdateCall(qS) {
  document.getElementById("adminTag").innerHTML = "";

  if (!qS.empty)
    db.collection(getStudentCollectionPath(currentUserId)).onSnapshot(
      snapshotUpdateCall
    );
}

/**
 *
 * Trigger modal to enter new student into classroom
 *
 */
function addNewParticipant() {
  if (currentUserId == null) {
    window.alert("You must first select a teacher/classroom");
    return;
  }

  var pName = document.getElementById("addParticipantTag").value;

  if (pName == null || pName.length < 2) {
    window.alert("Please supply a name or tag for the student");
    return;
  }

  var pTarget = document.getElementById("addParticipantTarget").value,
    pSetSize = document.getElementById("addParticipantSetSize").value,
    pSetNum = document.getElementById("addParticipantSetNumber").value,
    pPrf = document.getElementById("addPresentation").value,
    noPref = pPrf == "No Preference";

  if (!$.isNumeric(pSetSize)) {
    alert("The set size must be a number.");
    return;
  }

  if (!$.isNumeric(pSetNum)) {
    alert("The set selection must be numbered.");
    return;
  }

  db.collection(getStudentCollectionPath(currentUserId))
    .add({
      name: pName,
      target: pTarget,
      set: parseInt(pSetNum),
      setSize: parseInt(pSetSize),
      preferredOrientation: pPrf,
      hasPreference: !noPref,
    })
    .then(function (_) {
      $("#addParticipantModal").modal("hide");

      document.getElementById("addParticipantTag").value = "";
      document.getElementById("addParticipantTarget").value = "";
      document.getElementById("addParticipantSetSize").value = "";
      document.getElementById("addParticipantSetNumber").value = "";
      document.getElementById("addPresentation").value = "";
    })
    .catch(function (err) {
      alert(err);
    });
}

/**
 *
 * Event fired when current student changes
 *
 * @param {String} studentId id for student
 * @param {String} studentName name for student
 * @param {String} targetSkill name of targeted skill
 */
function updateParticipant(studentId, studentName, targetSkill) {
  document.getElementById("tagParticipantSpan").innerHTML = name;

  const currPath = getStudentPerformanceCollectionPath(
    studentId,
    currentUserId,
    targetSkill
  );

  if (oldListenerPath != null || oldListenerPath == currPath) {
    var unsubscribe = db.collection(oldListenerPath).onSnapshot(function () {});
    unsubscribe();
  }

  oldListenerPath = currPath;

  db.collection(currPath).onSnapshot((snapshot) => {
    const data = snapshot.docs
      .map((doc) => ({
        ...doc.data(),
      }))
      .sort(function (a, b) {
        return new Date(a.dateTimeStart) - new Date(b.dateTimeStart);
      });

    updateIndividualDataTable(data, studentName);
  });
}

/**
 *
 * Call to update the interface with data
 *
 * @param {Array} individualPerfData array of student-specific performances
 * @param {String} studentName string of student name
 */
function updateIndividualDataTable(individualPerfData, studentName) {
  var tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  var rowId = 1;

  /*
  data = [];
  data.push([
    "Date",
    "Target",
    "Set Size",
    "Set",
    "Correct",
    "Incorrect",
    "Time",
    "Percentage",
  ]);
  */

  individualPerfData.forEach(function (row) {
    var newRow = document.createElement("tr");

    // Session Num
    var cell = document.createElement("td");
    var cellText = document.createTextNode(rowId);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Session Date
    cell = document.createElement("td");
    cellText = document.createTextNode(row.dateTimeStart);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // difficultyLevel
    cell = document.createElement("td");
    cellText = document.createTextNode(row.target);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Set Size
    cell = document.createElement("td");
    cellText = document.createTextNode(row.setSize);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Set ID
    cell = document.createElement("td");
    cellText = document.createTextNode(row.set);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // Number of retries
    cell = document.createElement("td");
    cellText = document.createTextNode(row.nRetries);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    var pct = (row.nCorrectInitial / parseFloat(row.setSize)) * 100;

    cell = document.createElement("td");
    cellText = document.createTextNode(pct.toFixed(2));
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(row.sessionDuration);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    var nMin = row.sessionDuration / 60;
    var cpm = (row.nCorrectInitial / nMin) * 100;

    cell = document.createElement("td");
    cellText = document.createTextNode(cpm.toFixed(2));
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(row.errCount);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

    /*
    data.push([
      row.sessionDate,
      row.target,
      row.setSize,
      row.set,
      row.nCorrectInitial,
      row.errCount,
      row.sessionDuration,
      pct.toFixed(2),
    ]);
    */

    rowId++;
  });

  updateFigure(studentName);
}

/**
 *
 * Update the current figure
 *
 * @param {*} studentName current student name
 */
function updateFigure(studentName) {
  var mPlotData = [];

  var min = null;
  var max = null;

  var table = document.getElementById("tableBody");
  for (var i = 0, row; (row = table.rows[i]); i++) {
    var dateString = row.cells[1].innerText;
    dateString = dateString.split(".")[0];

    var momentObj = moment(dateString);

    if (min == null || max == null) {
      min = momentObj;
      max = momentObj;
    }

    min = momentObj.isBefore(min) ? momentObj : min;
    max = momentObj.isAfter(max) ? momentObj : max;

    mPlotData.push({
      x: moment(dateString),
      y: parseFloat(row.cells[6].innerText),
    });
  }

  var config = {
    type: "line",
    data: {
      datasets: [
        {
          label: "Accuracy",
          data: mPlotData,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Participant: " + studentName,
        },
      },
      responsive: true,
      tooltips: {
        mode: "index",
      },
      scales: {
        x: {
          type: "time",
          min: min == null ? null : min.subtract(1, "days"),
          max: max == null ? null : max.add(1, "days"),
          time: {
            unit: "day",
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Session",
          },
          ticks: {
            source: "auto",
            major: {
              fontStyle: "bold",
              fontColor: "#FF0000",
            },
          },
        },
        y: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Accuracy",
          },
          ticks: {
            suggestedMin: 0,
          },
        },
      },
    },
  };

  var ctx = document.getElementById("canvas").getContext("2d");

  if (window.myLine != null) {
    window.myLine.destroy();
  }
  window.myLine = new Chart(ctx, config);
  window.myLine.update();
}

/**
 *
 * Update figure with classwide data
 *
 * @param {Array} arrayOfArrays arrays of student-specific arrays
 */
function updateFigureClasswide(arrayOfArrays) {
  var min = null;
  var max = null;

  var datasetsBig = [];

  for (var i = 0; i < arrayOfArrays.length; i++) {
    var student = arrayOfArrays[i].data;
    var dataSeries = [];
    var id = null,
      name = null;

    if (student.length > 1) {
      var student = student.sort(function (a, b) {
        return new Date(a.dateTimeStart) - new Date(b.dateTimeStart);
      });

      for (var j = 0; j < student.length; j++) {
        var data = student[j];

        id = id == null ? data.id : id;
        name = name == null ? arrayOfArrays[i].name : name;

        const pct = (data.nCorrectInitial / parseFloat(data.setSize)) * 100;
        const dateString = data.dateTimeStart.split(".")[0];
        const momentObj = moment(dateString);

        if (min == null || max == null) {
          min = momentObj;
          max = momentObj;
        }

        min = momentObj.isBefore(min) ? momentObj : min;
        max = momentObj.isAfter(max) ? momentObj : max;

        dataSeries.push({
          x: moment(dateString),
          y: parseFloat(pct.toFixed(2)),
        });
      }

      // TODO: smarter way to assign colours

      var colour = getRandomColor();

      datasetsBig.push({
        label: name,
        data: dataSeries,
        borderColor: colour,
        backgroundColor: colour,
        fill: false,
        lineTension: 0,
      });
    }
  }

  const config = {
    type: "line",
    data: {
      datasets: datasetsBig,
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Participant: Whole Class",
        },
        colorschemes: {
          scheme: "tableau.Tableau20",
        },
      },
      responsive: true,
      tooltips: {
        mode: "index",
      },
      scales: {
        x: {
          type: "time",
          min: min.subtract(1, "days"),
          max: max.add(1, "days"),
          time: {
            unit: "day",
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Session",
          },
          ticks: {
            source: "auto",
            major: {
              fontStyle: "bold",
              fontColor: "#FF0000",
            },
          },
        },
        y: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Accuracy",
          },
          ticks: {
            suggestedMin: 0,
          },
        },
      },
    },
  };

  const ctx = document.getElementById("canvas").getContext("2d");

  if (window.myLine != null) {
    window.myLine.destroy();
  }

  window.myLine = new Chart(ctx, config);
  window.myLine.update();
}

/**
 *
 * Clear the current figure being shown
 *
 */
function clearFigure() {
  var mPlotData = [];

  var config = {
    type: "line",
    data: {
      datasets: [
        {
          label: "Accuracy",
          data: mPlotData,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Participant: ",
        },
      },
      scales: {
        x: {
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
        y: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Accuracy",
          },
          ticks: {
            suggestedMin: 0,
          },
        },
      },
    },
  };

  if (window.myLine != null) {
    window.myLine.destroy();
  }
  var ctx = document.getElementById("canvas").getContext("2d");

  window.myLine = new Chart(ctx, config);
  window.myLine.update();
}

/**
 *
 * Download the current table
 *
 */
function download() {
  // TODO: stubbed for now
  /*
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
  */
}

function getRandomColor() {
  var letters = "0123456789ABCDEF".split("");
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 *
 * Launch the session editor dialog
 *
 */
$(document).on("click", ".open-sessionDialog", function () {
  var pId = $(this).data("id");
  var pTag = $(this).data("participanttag");
  var pTgt = $(this).data("participanttarget");
  var pSS = $(this).data("participantsetsize");
  var pNum = $(this).data("participantset");
  var pPrf = $(this).data("participantpresentation");

  $(".modal-body #editParticipantTag").val(pTag);
  $(".modal-body #editParticipantTarget").val(pTgt);
  $(".modal-body #editParticipantSetSize").val(pSS);
  $(".modal-body #editParticipantSet").val(pNum);
  $(".modal-body #editParticipantID").val(pId);
  $(".modal-body #editPresentation").val(pPrf);

  $("#editParticipantSave").click(null);
  $("#editParticipantSave")
    .unbind()
    .click(function () {
      var pTag = document.getElementById("editParticipantTag").value,
        pTgt = document.getElementById("editParticipantTarget").value,
        pSS = document.getElementById("editParticipantSetSize").value,
        pNum = document.getElementById("editParticipantSet").value,
        pPrf = document.getElementById("editPresentation").value;

      if (pTag == null || pTag.length < 3) {
        window.alert("Please supply a name or tag for the student");
        return;
      }

      if (!$.isNumeric(pSS)) {
        window.alert("Set size must be a number.");
        return;
      }

      if (!$.isNumeric(pNum)) {
        window.alert("Set number must be a number.");
        return;
      }

      pSS = parseInt(pSS);
      pNum = parseInt(pNum);

      var noPref = pPrf == "No Preference";

      db.doc(getStudentCollectionPath(currentUserId) + "/" + pId)
        .update({
          name: pTag,
          set: pNum,
          setSize: pSS,
          target: pTgt,
          preferredOrientation: pPrf,
          hasPreference: !noPref,
        })
        .then(function (_) {
          $("#editParticipantModal").modal("hide");

          document.getElementById("editParticipantTag").value = "";
          document.getElementById("editParticipantTarget").value = "";
          document.getElementById("editParticipantSetSize").value = "";
          document.getElementById("editParticipantSet").value = "";
          document.getElementById("editParticipantID").value = "";
          document.getElementById("editParticipantID").value = "";
        })
        .catch(function (err) {
          alert(err);
        });

      $("#editParticipantSave").click(null);
    });
});
