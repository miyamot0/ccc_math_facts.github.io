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
  totalCollRef();

  document.getElementById("participantDiv").innerHTML = "";
  var tableBody = document.getElementById("tableBody2");
  tableBody.innerHTML = "";

  var tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  var selectHolderRef = document.getElementById("selectHolder");
  selectHolderRef.innerHTML = "";

  document.getElementById("nParticipantSpan").innerHTML = buildHeader(
    '...'
  );

  clearFigure();

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

function getCollectionPath() {
  return "mainCollection";
}

function getStudentCollectionPath(id) {
  return "mainCollection/" + id + "/students";
}

function buildHeader(size) {
  return size == 1 ? "1 participant" : size + " participants";
}

function onTeacherUpdateCall(querySnapshot) {
  if (!querySnapshot.empty) {

    var selectHolderRef = document.getElementById("selectHolder");
    selectHolderRef.innerHTML = "";
     
    var selectList = document.createElement("select");
    selectList.id = "selectListId";

    var option = document.createElement("option");
    option.value = null;
    option.text = "Please select teacher";
    selectList.appendChild(option);

    querySnapshot.forEach(function (doc) {
      const teacher = doc.data();

      var option = document.createElement("option");
      option.value = doc.id;
      option.text = teacher.teacherName;
      selectList.appendChild(option);
    });

    selectHolderRef.addEventListener("change", function() {
      var selRef = document.getElementById("selectListId");

      if (selRef.value != null) {
        document.getElementById("participantDiv").innerHTML = "";
        var tableBody = document.getElementById("tableBody2");
        tableBody.innerHTML = "";

        var tableBody = document.getElementById("tableBody");
        tableBody.innerHTML = "";

        clearFigure();

        currentUserId = selRef.value;

        const path = getStudentCollectionPath(currentUserId);
        var studentCollRef = db.collection(path).onSnapshot(snapshotUpdateCall);
      } else {
        currentUserId = null;
      }
    });

    selectHolderRef.appendChild(selectList);
  }
}

function snapshotUpdateCall(querySnapshot) {
  if (!querySnapshot.empty) {

    document.getElementById("nParticipantSpan").innerHTML = buildHeader(
      querySnapshot.size
    );

    document.getElementById("participantDiv").innerHTML = "";
    var tableBody = document.getElementById("tableBody2");
    tableBody.innerHTML = "";

    querySnapshot.forEach(function (doc) {
      const data = doc.data();

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
        'javascript:updateParticipant("' + doc.id + '","' + data.name + '");'
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
      aTag.setAttribute("data-participantTarget", data.target);
      aTag.setAttribute("data-participantSetSize", data.setSize);
      aTag.setAttribute("data-participantSet", data.set);

      aTag.innerHTML = "Edit Session";

      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);
    });
  } else {
    document.getElementById("nParticipantSpan").innerHTML = buildHeader(
      '...'
    );
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
  const user = firebase.auth().currentUser;
  const currPath =
    "mainCollection/" +
    currentUserId +
    "/Math Facts-Addition/students/" +
    tag;

  console.log(currentUserId);
  console.log(currPath);

  if (oldListenerPath != null || oldListenerPath == currPath) {
    var unsubscribe = db.collection(oldListenerPath).onSnapshot(function () {});
    unsubscribe();
  }

  oldListenerPath = currPath;

  var docRef = db.collection(currPath);

  document.getElementById("tagParticipantSpan").innerHTML = name;

  docRef.onSnapshot((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    updateTable(data, name);
  });
}


$(document).on("click", ".open-sessionDialog", function () {
  var pId = $(this).data("id");
  var pTag = $(this).data("participanttag");
  var pTgt = $(this).data("participanttarget");
  var pSS = $(this).data("participantsetsize");
  var pNum = $(this).data("participantset");

  $(".modal-body #editParticipantTag").val(pTag);
  $(".modal-body #editParticipantTarget").val(pTgt);
  $(".modal-body #editParticipantSetSize").val(pSS);
  $(".modal-body #editParticipantSet").val(pNum);
  $(".modal-body #editParticipantID").val(pId);

  $("#editParticipantSave").click(null);
  $("#editParticipantSave")
    .unbind()
    .click(function () {
      var pTag = document.getElementById("editParticipantTag").value;
      var pTgt = document.getElementById("editParticipantTarget").value;
      var pSS = document.getElementById("editParticipantSetSize").value;
      var pNum = document.getElementById("editParticipantSet").value;

      if (!$.isNumeric(pSS)) {
        alert("Duration (seconds) must be a number.");
        return;
      }

      if (!$.isNumeric(pNum)) {
        alert("Trials (counts) must be a number.");
        return;
      }

      pSS = parseInt(pSS);
      pNum = parseInt(pNum);

      const user = firebase.auth().currentUser;
      const path = getStudentCollectionPath(currentUserId) + "/" + pId;

      db.doc(path)
        .update({
          name: pTag,
          set: pNum,
          setSize: pSS,
          target: pTgt,
        })
        .then(function (docRef) {
          $("#editParticipantModal").modal("hide");

          document.getElementById("editParticipantTag").value = "";
          document.getElementById("editParticipantTarget").value = "";
          document.getElementById("editParticipantSetSize").value = "";
          document.getElementById("editParticipantSet").value = "";
          document.getElementById("editParticipantID").value = "";
        })
        .catch(function (err) {
          alert(err);
        });

      $("#editParticipantSave").click(null);
    });
});

function updateTable(prePlotter, name) {
  var tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  var rowId = 0;

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

  prePlotter.forEach(function (row) {
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

    // trialCount
    cell = document.createElement("td");
    cellText = document.createTextNode(row.setSize);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // trialCount
    cell = document.createElement("td");
    cellText = document.createTextNode(row.set);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    // trialCount
    cell = document.createElement("td");
    cellText = document.createTextNode(row.nRetries);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    var pct = (row.nCorrectInitial / parseFloat(row.setSize)) * 100

    cell = document.createElement("td");
    cellText = document.createTextNode(pct.toFixed(2));
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(row.sessionDuration);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    var nMin = row.sessionDuration/60;
    var cpm = (row.nCorrectInitial / nMin) * 100

    cell = document.createElement("td");
    cellText = document.createTextNode(cpm.toFixed(2));
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(row.errCount);
    cell.appendChild(cellText);
    newRow.appendChild(cell);

    tableBody.appendChild(newRow);

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
    
    rowId++;
  });

  updateFigure(name);
}

function clearFigure() {
  var mLabels = [];

  var mPlotData = [];

  var table = document.getElementById("tableBody");

  var config = {
    type: "line",
    data: {
      labels: mLabels,
      datasets: [
        {
          label: "Accuracy",
          data: mPlotData,
          //borderColor: window.chartColors.green,
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        }
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Participant: " + name,
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

function updateFigure(name) {
  var mLabels = [];

  var mPlotData = [];

  var table = document.getElementById("tableBody");
  for (var i = 0, row; (row = table.rows[i]); i++) {
    mPlotData.push({
      x: i,
      y: parseFloat(row.cells[6].innerText),
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
          //borderColor: window.chartColors.green,
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          lineTension: 0,
        }
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Participant: " + name,
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

}
