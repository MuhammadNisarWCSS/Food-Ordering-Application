
//Lets the server know to log the user in 
function loginSubmit() {


    let loginInfo = {};

    loginInfo.username = document.getElementById("loginUsername").value;
    loginInfo.password = document.getElementById("loginPassword").value; 

    //Create a new XMLHttpRequest
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {

		//If the username does not exist in the database
		if(this.readyState==4 && this.status==406){

            //Alert the client that the username could not be found
            alert("Username : " + loginInfo.username + " could not be found");
		}

        //If the password is incorrect, alert the client
        if(this.readyState== 4 && this.status==418) {

            alert("Incorrect password");
        }

        //If the request was succcessful and the user is logged in, redirecct the user to the home page
        if (this.readyState==4 && this.status==200) {

            window.location.href = "http://localhost:3000/"
        }
	}
	
	//Send a POST request to the server. Sends JSON of the login information
	req.open("POST", '/login');
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(loginInfo));
}