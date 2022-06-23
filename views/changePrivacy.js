
//Togles the client's privacy
function changePrivacy() {


    let newPrivacy = {}
    

    //If the client's privacy is true, switch it to false.
    if (object.privacy == true) {

        newPrivacy = {privacyStatus : false, username: object.username};
    }

    //If the client's privacy is false, switch it to true.
    if (object.privacy == false) {

        newPrivacy = {privacyStatus : true, username: object.username};
    }
    


    //Create a new XMLHttpRequest
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {

		//If the request was successful, update the client as to what their new privacy status is, and refresh the page
        if(this.readyState==4 && this.status==200) {

            if (newPrivacy.privacyStatus == true) {

                alert("Your account is now set to private");
                window.location.href = "http://localhost:3000/users/" + object._id;
            }

            if (newPrivacy.privacyStatus == false) {

                alert("Your account is now set to public");
                window.location.href = "http://localhost:3000/users/" + object._id;
            }
            
        }

        //If the request was not successful, let the client know that they do not have permission to change the privacy setting
        if(this.readyState==4 && this.status==404) {
            alert("You must be logged in as " + object.username + " to change this privacy setting");
        }
	}
	
	//Send a POST request to the server. Sends JSON of the new privacy status
	req.open("POST", '/changePrivacy');
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(newPrivacy));
}