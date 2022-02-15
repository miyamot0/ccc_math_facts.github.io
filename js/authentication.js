function login() {
    var userEmail = document.getElementById("email_field").value;
    var userPass  = document.getElementById("password_field").value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        window.alert("Error : " + errorMessage);
    });
}

function logout(){
    firebase.auth().signOut();
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        document.getElementById("login_block").style.display = "none";

        var myClasses = document.querySelectorAll('.authElements'),
            i = 0,
            l = myClasses.length;
    
        for (i; i < l; i++) {
            myClasses[i].style.display = 'block';
        }

        // TODO: pull participants and potentially edit
        // TODO: display active participants 
    } else {
        document.getElementById("login_block").style.display = "block";

        var myClasses = document.querySelectorAll('.authElements'),
            i = 0,
            l = myClasses.length;
    
        for (i; i < l; i++) {
            myClasses[i].style.display = 'none';
        }
    }
});