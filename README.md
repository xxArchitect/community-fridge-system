#  Community Fridge Management System

Website for the Community Fridge Management System. This website was built as a course project for [COMP 2406](https://calendar.carleton.ca/search/?P=COMP%202406) at Carleton University. 
The purpose of this website is to create a management system for community fridges that distribute food to those in need. It
can be used for both picking up and dropping off items. 

# Features

- View the list of available fridges
- View and pickup items in the selected fridge
- Edit information about the fridge 
- Add a new fridge
- Drop off a specific item into the one of the fridge
  + System gives specific suggestions based on which fridge has the lowest amount of selected item
- Create new items by specifying name, type and uploading a picture


# Setup 

This application was built using **JavaScript ES6**, **HTML5**, **CSS**, and **Express.js**. Hence, to use, you need to
install **Node.js** and then use **npm** to install **Express.js**. Here are detailed instructions for 
you to follow: 
1. Install **Node.js** by downloading the installer from [**here**](https://github.com/markdown-it/markdown-it-emoji).
2. Clone this repository into a local folder on your machine use the following instruction in the terminal:
  ``` 
  git clone https://github.com/xxArchitect/community-fridge-system.git
  ```
3. Navigate into the <ins>community-fridge-system</ins> folder and run the following command to install dependencies:
  ``` 
  npm install
  ```
4. Run the following command to start server: 
  ``` 
  node server.js
  ```
5. Access the website at 
