// Teacher update call (re-fresh students)
function onAdminUpdateCall(querySnapshot) {
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
      var option = document.createElement("option");
      option.value = doc.id;
      option.text = doc.data().teacherName;
      selectList.appendChild(option);
    });

    selectHolderRef.addEventListener("change", function () {
      var selRef = document.getElementById("selectListId");

      if (selRef.value != null) {
        document.getElementById("participantDiv").innerHTML = "";
        document.getElementById("tableBody").innerHTML = "";
        document.getElementById("tableBody2").innerHTML = "";

        clearFigure();

        // Lazy ref to global
        currentUserId = selRef.value;

        db.collection(getStudentCollectionPath(currentUserId)).onSnapshot(
          snapshotUpdateCall
        );
      } else {
        currentUserId = null;
      }
    });

    selectHolderRef.appendChild(selectList);
  }
}

// Map student in teacher classroom
function snapshotUpdateCall(querySnapshot) {
  if (!querySnapshot.empty) {
    document.getElementById("nParticipantSpan").innerHTML = buildHeader(
      querySnapshot.size
    );

    document.getElementById("participantDiv").innerHTML = "";
    var tableBody = document.getElementById("tableBody2");
    tableBody.innerHTML = "";

    var nParticipants = 0;

    querySnapshot.forEach(function (doc) {
      const data = doc.data();

      nParticipants++;

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
      cell.style = "display:none";
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute(
        "href",
        'javascript:updateParticipant("' +
          doc.id +
          '","' +
          data.name +
          '","' +
          data.target +
          '");'
      );
      aTag.setAttribute("class", "leading btn btn-raised");
      aTag.innerHTML = "Load Progress";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute("data-toggle", "modal");
      aTag.setAttribute("data-target", "#editParticipantModal");
      aTag.setAttribute("class", "leading btn btn-raised open-sessionDialog");
      aTag.setAttribute("data-id", doc.id);
      aTag.setAttribute("data-participantTag", data.name);
      aTag.setAttribute("data-participantTarget", data.target);
      aTag.setAttribute("data-participantSetSize", data.setSize);
      aTag.setAttribute("data-participantSet", data.set);
      aTag.setAttribute(
        "data-participantPresentation",
        data.preferredOrientation
      );
      aTag.innerHTML = "Edit Session";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute(
        "href",
        'javascript:pullMembersInClass("' + data.target + '");'
      );
      aTag.setAttribute("class", "leading btn btn-raised");
      aTag.innerHTML = "Show Class";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);
    });
  } else {
    document.getElementById("nParticipantSpan").innerHTML = buildHeader("...");
  }
}

// Reference Table, get all relevant class info
function pullMembersInClass(target) {
  var promArray = [];
  var table = document.getElementById("tableBody2");
  var rowCount = table.rows.length;

  for (var i = 0; i < rowCount; i++) {
    const id = table.rows[i].cells[4].innerText;
    const name = table.rows[i].cells[0].innerText;

    var currPath = getStudentPerformanceCollectionPath(id, target);
    var a = db
      .collection(currPath)
      .get()
      .then((qs) => {
        var dataObject = {
          data: qs.docs.map((doc) => ({
            ...doc.data(),
          })),
          name: name,
          target: target,
        };

        return dataObject;
      });

    promArray.push(a);
  }

  Promise.all(promArray).then((arrayOfArrays) =>
    updateFigureClasswide(arrayOfArrays)
  );
}

// Updating figure for participant
function updateFigureClasswide(arrayOfArrays) {
  var min = null;
  var max = null;

  var datasetsBig = [];

  for (var i = 0; i < arrayOfArrays.length; i++) {
    var student = arrayOfArrays[i].data;
    var dataSeries = [];
    var id = null;
    var name = null;

    if (student.length > 1) {
      var student = student.sort(function (a, b) {
        return new Date(a.dateTimeStart) - new Date(b.dateTimeStart);
      });

      for (var j = 0; j < student.length; j++) {
        var data = student[j];

        id = id == null ? data.id : id;
        name = name == null ? arrayOfArrays[i].name : name;

        var pct = (data.nCorrectInitial / parseFloat(data.setSize)) * 100;

        var dateString = data.dateTimeStart;
        dateString = dateString.split(".")[0];

        var momentObj = moment(dateString);

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

  var config = {
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

  var ctx = document.getElementById("canvas").getContext("2d");

  if (window.myLine != null) {
    window.myLine.destroy();
  }
  window.myLine = new Chart(ctx, config);
  window.myLine.update();
}
