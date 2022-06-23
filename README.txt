Author : Muhammad Nisar

A food ordering application.
To start ordering, register for an account or if you're a returning user, log in.
Once you place an order, your order history is stored on the User Profile page, where all your previous orders are displayed. 
On the User Profile page, you can opt to make your account private by clicking on the "Toggle privacy" button.
With a private account, your account will no longer show up on Users page.

Registration and authentication info is stored in the MongoDB database.
MongoDB session is used to store session data. If you are logged in and close the browser, you will still be logged in when you re-open the browser.


To run :

Step 1 : Starting up the MongoDB daemon  
 - Open up a terminal
 - CD inside the assignment folder
 - Create a directory called "database"
 - Type mongod --dbpath=database and press enter


Step 2 : Connecting to mongo on terminal 
 - Open another terminal, type in mongo and press enter


Step 3 : Installing dependencies and starting the server  
    - Type "npm install" in terminal to install all the required dependencies
    - Type "node .\database-initializer.js" to initialize the database
    - Type "node server.js" in terminal to start up the server
    - Go to http://127.0.0.1:3000/

