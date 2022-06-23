

//Submits the registration data to the server
function registerSubmit() {


    let registrationInfo = {};

    registrationInfo.username = document.getElementById("registerUsername").value;
    registrationInfo.password = document.getElementById("registerPassword").value; 

    //Create an XMLHttpRequest
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {

		//If the request was not successful, alert the user that the username is already taken.
		if(this.readyState==4 && this.status==406){

            alert("This username is already taken");
		}

        //If the rrequest was successful, redirect the user to their profile page.
        if(this.readyState==4 && this.status==200) {

            window.location.href = "http://localhost:3000/users/" + JSON.parse(req.response);
        }
	}
	
	//Send a POST request to the server. Sends JSON of the registration information.
	req.open("POST", '/register');
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(registrationInfo));
}

